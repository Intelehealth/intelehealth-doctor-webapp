import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { AiddxLibraryModule, AiddxService, AillmddxComponent, ENVIRONMENT } from 'aiddx-library';
import { isFeaturePresent } from 'src/app/utils/utility-functions';
import { environment } from 'src/environments/environment';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EncounterModel, ObsApiResponseModel, ObsModel } from 'src/app/model/model';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { conceptIds } from 'src/config/constant';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    NgSelectModule,
    TranslateModule,
    AiddxLibraryModule
  ],
  providers: [
    AiddxService,
    { provide: ENVIRONMENT, useValue: environment }
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DiagnosisComponent implements OnInit {
  @ViewChild(AillmddxComponent) aillmddxComponent: AillmddxComponent;
  @Input() visit: any;
  @Input() patientInfo: any;
  @Input() isMCCUser: boolean = false;
  @Input() isVisitNoteProvider: boolean = false;
  @Input() visitEnded: EncounterModel | string;
  @Input() patientInteractionNotesForm: FormGroup;

  diagnosisForm: FormGroup;
  diagnosisSecondaryForm: FormGroup;
  existingDiagnosis: any[] = [];
  addMoreDiagnosis: boolean = false;
  diagnosis$: Observable<any>;
  diagnosisValidated: boolean = false;
  private dSearchSubject = new Subject<string>();
  private diagnosisSubject = new Subject<any[]>();

  hasAILLMEnabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    public appConfigService: AppConfigService,
    private diagnosisService: DiagnosisService,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {
    this.diagnosisForm = this.fb.group({
      diagnosisName: ['', Validators.required],
      diagnosisType: ['', Validators.required],
      diagnosisStatus: ['', Validators.required]
    });

    this.diagnosis$ = this.diagnosisSubject.asObservable();

    this.hasAILLMEnabled = this.appConfigService?.ai_llm_section;
  }

  ngOnInit() {
    this.dSearchSubject.subscribe(val => {
      this.searchDiagnosis(val);
    });
    this.checkIfDiagnosisPresent();
    this.checkIfNotePresent();
  }

  get selectedDiagnoses(): string[] {
    return this.aillmddxComponent?.selectedDiagnosis || [];
  }

  checkIfDiagnosisPresent(): void {
    this.existingDiagnosis = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptDiagnosis).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (obs.value.includes("}") && this.appConfigService.patient_visit_summary?.dp_dignosis_secondary) {
            this.diagnosisSecondaryForm.patchValue(this.obsParse(obs.value, obs.uuid));
          } else {
            if (obs.value.includes("}")) {
              let obsData: any = this.obsParse(obs.value, obs.uuid);
              this.existingDiagnosis.push({
                diagnosisName: obsData.diagnosis,
                diagnosisStatus: obsData.type,
                uuid: obsData.uuid,
              });
            } else {
              if (this.appConfigService.patient_visit_summary?.dp_dignosis_secondary) {
                this.diagnosisService.deleteObs(obs.uuid).subscribe();
              } else {
                let obsValues = obs.value.split(':');
                if (obs.value.includes("::")) {
                  obsValues = obs.value.split("::").pop()?.split(":");
                }
                const obsValuesOne = obsValues[1]?.split('&');
                this.existingDiagnosis.push({
                  diagnosisName: obsValues[0]?.trim(),
                  diagnosisType: obsValuesOne[0]?.trim(),
                  diagnosisStatus: obsValuesOne[1]?.trim(),
                  uuid: obs.uuid,
                });
              }
            }
          }
        }
      });
    });
  }

  onKeyUp(event: { term: string }): void {
    this.diagnosisForm.controls.diagnosisName.reset();
    this.diagnosisValidated = false;
    this.dSearchSubject.next(event.term);
  }

  searchDiagnosis(val: string): void {
    if (val && val.length >= 3) {
      this.diagnosisService.getDiagnosisList(val, isFeaturePresent("snomedCtDiagnosis") ? 'SNOMED' : 'ICD10').subscribe({
        next: (response) => {
          if (response.results && response.results.length) {
            const data = [];
            response.results.forEach((element: { name: any, mappings: any }) => {
              if (element) {
                data.push({ name: element?.name?.display, snomedId: element?.mappings?.[0] });
              }
            });
            this.diagnosisSubject.next(data);
          } else {
            if (isFeaturePresent("snomedCtDiagnosis")) {
              this.diagnosisService.getSnomedDiagnosisList(val).subscribe({
                next: (res) => {
                  if (res && res.result) {
                    const data = res?.result.map((element: { term: string, conceptId: string }) => ({ name: element.term, conceptId: element?.conceptId }));
                    this.diagnosisSubject.next(data);
                  } else {
                    this.diagnosisSubject.next([]);
                  }
                },
                error: () => {
                  this.diagnosisSubject.next([]);
                }
              });
            } else {
              this.diagnosisSubject.next([]);
            }
          }
        },
        error: () => {
          this.diagnosisSubject.next([]);
        }
      });
    }
  }

  onDiagnosisChange(event: any): void {
    this.diagnosisValidated = true;
    if (isFeaturePresent("snomedCtDiagnosis")) {
      if (event?.conceptId) {
        this.diagnosisForm.addControl('diagnosisCode', new FormControl(null));
        this.diagnosisForm.addControl('isSnomed', new FormControl(null));
        this.diagnosisForm.patchValue({ diagnosisCode: event.conceptId });
        this.diagnosisForm.patchValue({ isSnomed: true });
      }
      else if (event?.snomedId) {
        this.diagnosisForm.addControl('diagnosisCode', new FormControl(null));
        this.diagnosisForm.patchValue({ diagnosisCode: event.snomedId?.display.split(': ')[1] });
      }
    }
    if (this.selectedDiagnoses.length > 0) {
      this.onAIDiagnosisSelected();
    }
  }

  removeDiagnosis(diagnosis: string): void {
    if (this.aillmddxComponent) {
      this.aillmddxComponent.onAIDiagnosisChange(diagnosis);
    }
  }

  toggleDiagnosis(): void {
    this.addMoreDiagnosis = !this.addMoreDiagnosis;
    this.diagnosisForm.reset();
    this.selectedDiagnoses.splice(0, this.selectedDiagnoses.length);
  }

  saveDiagnosis(): void {
    if (this.selectedDiagnoses.length > 0) {
      const diagnosisName = this.diagnosisForm.value.diagnosisName?.replace(/:/g, ' ');
      this.diagnosisSubject.next(this.selectedDiagnoses);
      this.existingDiagnosis.push({ ...this.diagnosisForm.value, diagnosisName: diagnosisName });
      this.removeDiagnosis(diagnosisName);
      this.diagnosisForm.patchValue({ diagnosisName: this.selectedDiagnoses?.[0] || null });
      this.diagnosisForm.controls.diagnosisType.reset();
      this.diagnosisForm.controls.diagnosisStatus.reset();
    }
    if (this.diagnosisForm.invalid || !this.isVisitNoteProvider || !this.diagnosisValidated) {
      return;
    }
    if (this.existingDiagnosis.find(o => o.diagnosisName.toLocaleLowerCase() === this.diagnosisForm.value.diagnosisName.toLocaleLowerCase())) {
      this.toastr.warning(this.translateService.instant('Diagnosis Already Exist'), this.translateService.instant('Duplicate Diagnosis'));
      return;
    }
    const diagnosisName = this.diagnosisForm.value.diagnosisName?.replace(/:/g, ' ');
    this.existingDiagnosis.push({ ...this.diagnosisForm.value, diagnosisName: diagnosisName });
    this.diagnosisForm.reset();
  }

  deleteDiagnosis(index: number, uuid: string): void {
    if (uuid) {
      this.diagnosisService.deleteObs(uuid).subscribe(() => {
        this.existingDiagnosis.splice(index, 1);
      });
    } else {
      this.existingDiagnosis.splice(index, 1);
    }
  }

  autoGrowTextZone(event: any) {
    const element = event.target;
    element.style.height = "5px";
    element.style.height = (element.scrollHeight) + "px";
  }

  isFeatureAvailable(featureName: string): boolean {
    return isFeaturePresent(featureName);
  }

  private obsParse(value: string, uuid: string): any {
    try {
      const parsedValue = JSON.parse(value);
      return {
        diagnosis: parsedValue.diagnosis,
        type: parsedValue.type,
        uuid: uuid
      };
    } catch (e) {
      return {
        diagnosis: '',
        type: '',
        uuid: uuid
      };
    }
  }

  onAIDiagnosisSelected(): void {
    this.diagnosisForm.get('diagnosisName').patchValue(this.selectedDiagnoses[0]);
  }

  saveDDxNotes(): void {
    this.aillmddxComponent.getAIDiagnosisWithRetry(this.patientInteractionNotesForm.value.value);
  }

  /**
   * Get notes for the visit
   * @returns {void}
   */
  checkIfNotePresent(): void {
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptNote)
      .subscribe({
        next: (response: ObsApiResponseModel) => {
          response.results.forEach((obs: ObsModel) => {
            if (obs.encounter.visit.uuid === this.visit.uuid) {
              this.patientInteractionNotesForm.patchValue({ uuid: obs.uuid, value: obs.value });
            }
          });
          this.aillmddxComponent.getAIDiagnosisWithRetry(this.patientInteractionNotesForm.value.value);
        },
        error: () => {
          this.aillmddxComponent.getAIDiagnosisWithRetry(this.patientInteractionNotesForm.value.value);
        }
      });
  }
}
