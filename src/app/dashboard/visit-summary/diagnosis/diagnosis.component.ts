import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { AiddxLibraryModule, AiddxService, AiTxService, AillmddxComponent, AillmtxMedicationComponent, AillmtxAdviceComponent, ENVIRONMENT } from 'aiddx-library';
import { isFeaturePresent } from 'src/app/utils/utility-functions';
import { environment } from 'src/environments/environment';
import { AppConfigService } from 'src/app/services/app-config.service';
import { EncounterModel, ObsApiResponseModel, ObsModel } from 'src/app/model/model';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { DataItemModel, MedicineModel } from 'src/app/model/model';
import instructionRemarks from 'src/app/core/data/instructionRemarks';
import durationUnitList from 'src/app/core/data/durationUnitList';
import { conceptIds, days } from 'src/config/constant';
import doses from '../../../core/data/dose';
import { VisitService } from 'src/app/services/visit.service';
import { EncounterService } from 'src/app/services/encounter.service';
import medicines from '../../../core/data/medicines';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

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
    AiddxLibraryModule,
    NgbTypeaheadModule
  ],
  providers: [
    AiddxService,
    AiTxService,
    { provide: ENVIRONMENT, useValue: environment }
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DiagnosisComponent implements OnInit {
  @ViewChild(AillmddxComponent) aillmddxComponent: AillmddxComponent;
  @ViewChild(AillmtxMedicationComponent) aillmtxMedicationComponent: AillmtxMedicationComponent;
  @ViewChild(AillmtxAdviceComponent) aillmtxAdviceComponent: AillmtxAdviceComponent;
  @Input() visit: any;
  @Input() patientInfo: any;
  @Input() isMCCUser: boolean = false;
  @Input() isVisitNoteProvider: boolean = false;
  @Input() visitEnded: EncounterModel | string;
  @Input() patientInteractionNotesForm: FormGroup;

  diagnosisForm: FormGroup;
  diagnosisSecondaryForm: FormGroup;
  existingDiagnosis: any[] = [];
  existingMedication: any[] = [];
  addMoreDiagnosis: boolean = false;
  diagnosis$: Observable<any>;
  diagnosisValidated: boolean = false;
  private dSearchSubject = new Subject<string>();
  private diagnosisSubject = new Subject<any[]>();

  hasAILLMEnabled: boolean = false;

  medicines: MedicineModel[] = [];
  advices: ObsModel[] = [];
  additionalInstructions: ObsModel;
  daysList: DataItemModel[] = days.daysList
  durationUnitList: DataItemModel[] = durationUnitList;
  drugNameList: DataItemModel[] = [];
  advicesList: string[] = [];

  addMedicineForm: FormGroup;
  additionalInstructionForm: FormGroup;
  addAdviceForm: FormGroup;
  
  addMoreMedicine = false;
  addMoreAdvice = false;

  visitNotePresent: EncounterModel;


  constructor(
    private fb: FormBuilder,
    public appConfigService: AppConfigService,
    private diagnosisService: DiagnosisService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private visitService: VisitService,
    private encounterService: EncounterService,

  ) {
    this.diagnosisForm = this.fb.group({
      diagnosisName: ['', Validators.required],
      diagnosisType: ['', Validators.required],
      diagnosisStatus: ['', Validators.required]
    });

    this.addMedicineForm = new FormGroup({
      drug: new FormControl(null, [Validators.required]),
      dose: new FormControl(null, [Validators.required]),
      frequency: new FormControl(null),
      durationNo: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]*$')]),
      durationUnit: new FormControl(null, [Validators.required]),
      instructRemark: new FormControl('', [])
    });

    this.additionalInstructionForm = new FormGroup({
      uuid: new FormControl(null),
      value: new FormControl(null, [Validators.required])
    });

    this.addAdviceForm = new FormGroup({
      advice: new FormControl(null, [Validators.required])
    });

    this.diagnosis$ = this.diagnosisSubject.asObservable();

    this.hasAILLMEnabled = this.appConfigService?.ai_llm_section;
  }

  frequencyList = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Every 30 minutes", "Every hour", "Every four hours", "Every eight hours"];

  mainSearch = (text$: Observable<string>, list: string[]) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : list.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  search1 = (text$: Observable<string>) => this.mainSearch(text$, this.advicesList);
  search2 = (text$: Observable<string>) => this.mainSearch(text$, this.drugNameList.map((val) => val.name));
  search3 = (text$: Observable<string>) => this.mainSearch(text$, doses.map((val) => val.name));
  search4 = (text$: Observable<string>) => this.mainSearch(text$, this.daysList.map((val) => val.name));
  search5 = (text$: Observable<string>) => this.mainSearch(text$, this.durationUnitList.map((val) => val.name));
  search6 = (text$: Observable<string>) => this.mainSearch(text$, instructionRemarks.map((val) => val.name));

  ngOnInit() {
    this.dSearchSubject.subscribe(val => {
      this.searchDiagnosis(val);
    });
    this.checkIfDiagnosisPresent();
    this.checkIfNotePresent();
    this.checkIfMedicationPresent();
    this.getAdvicesList();
    this.checkIfAdvicePresent();
    medicines.forEach(med => {
      this.drugNameList.push({ 'id': med.id, 'name': this.translateService.instant(med.name) });
    });
  }

  get selectedDiagnoses(): string[] {
    return this.aillmddxComponent?.selectedDiagnosis || [];
  }

  get medicationSelected(): string[] {
    return this.aillmtxMedicationComponent?.selectedMedicine || [];
  }

  checkIfDiagnosisPresent(): void {
    this.existingDiagnosis = [];
    let lastMatchingObs: any = null; // <-- Track the last matching observation

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
              lastMatchingObs = obs; // <-- update with last matching
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
                lastMatchingObs = obs; // <-- update with last matching
              }
            }
          }
        }
      });

      if (lastMatchingObs) {
        this.aillmtxMedicationComponent.getAIMedicalAdviceWithRetry(lastMatchingObs?.value.split("::").pop()?.split(":")[0].trim());
        this.aillmtxAdviceComponent.getAIMedicalAdviceWithRetry(lastMatchingObs?.value.split("::").pop()?.split(":")[0].trim());
      }
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
      this.aillmtxMedicationComponent.getAIMedicalAdviceWithRetry(diagnosisName);
      this.aillmtxAdviceComponent.getAIMedicalAdviceWithRetry(diagnosisName);
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
    this.aillmtxMedicationComponent.getAIMedicalAdviceWithRetry(diagnosisName);
    this.aillmtxAdviceComponent.getAIMedicalAdviceWithRetry(diagnosisName);
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

  onAIMedicineSelected(): void {
    console.log('Selected Vishal:', this.medicationSelected);
    this.addMedicineForm.get('drug').patchValue(this.medicationSelected[0]);
    console.log('Selected Vishal after patch:', this.addMedicineForm.get('drug').value);
    return
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

  // checkIfDiagnosisPresent(): void {}
  onKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    // Allow only numbers (0-9), backspace (8), and delete (46)
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 8 && charCode !== 46) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  toggleMedicine(): void {
    this.addMoreMedicine = !this.addMoreMedicine;
    this.addMedicineForm.reset();
  }

  addMedicine(): void {
    if (this.addMedicineForm.invalid) {
      return;
    }
    if (this.medicines.find((o: MedicineModel) => o.drug === this.addMedicineForm.value.drug)) {
      this.toastr.warning(this.translateService.instant('Drug already added, please add another drug.'), this.translateService.instant('Already Added'));
      return;
    }
    // this.updatedObsData.medication = true;
    // this.checkChanges(this.updatedObsData);
    
    this.medicines.push({ ...this.addMedicineForm.value});
    this.addMedicineForm.reset();
    // this.encounterService.postObs({
    //   concept: conceptIds.conceptMed,
    //   person: this.visit.patient.uuid,
    //   obsDatetime: new Date(),
    //   value: `${this.addMedicineForm.value.drug}:${this.addMedicineForm.value.strength}:${this.addMedicineForm.value.days}:${this.addMedicineForm.value.timing}:${this.addMedicineForm.value.remark ?? ''}:${this.addMedicineForm.value.frequency ?? ''}`,
    //   encounter: this.visitNotePresent.uuid
    // }).subscribe((response: ObsModel) => {

    // });
  }
  
  checkIfMedicationPresent(): void {
    this.medicines = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptMed).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (obs.value.includes(':') && !this.appConfigService?.patient_visit_summary?.dp_medication_secondary) {
            this.medicines.push(this.visitService.formatMedicineDisplay(obs.value, obs.uuid));
          } else {
            this.additionalInstructionForm.patchValue({ uuid: obs.uuid, value: obs.value });
          }
        }
      });
    });
  }

  saveAdditionalInstruction(): Observable<any> {
    if (this.additionalInstructionForm.value.uuid) {
      if (this.additionalInstructionForm.valid)
        return this.encounterService.updateObs(this.additionalInstructionForm.value.uuid, {
          value: this.additionalInstructionForm.value.value
        })
      else
        return this.diagnosisService.deleteObs(this.additionalInstructionForm.value.uuid).pipe(tap((response: ObsModel) => this.additionalInstructionForm.patchValue({ uuid: null })))
    } else if (this.additionalInstructionForm.valid) {
      return this.encounterService.postObs({
        concept: conceptIds.conceptMed,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: this.additionalInstructionForm.value.value,
        encounter: this.visitNotePresent.uuid
      }).pipe(tap((response: ObsModel) => this.additionalInstructionForm.patchValue({ uuid: response.uuid })));
    } else {
      return of(false);
    }
  }

  /**
  * Delete medicine for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Medicine obs uuid
  * @returns {void}
  */
  deleteMedicine(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.medicines.splice(index, 1);
    });
  }

  /**
  * Get advices list
  * @returns {void}
  */
  getAdvicesList(): void {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid).subscribe(res => {
      const result = res.answers;
      result.forEach((ans: { display: string; }) => {
        this.advicesList.push(ans.display);
      });
    });
  }

  toggleAdvice(): void {
    this.addMoreAdvice = !this.addMoreAdvice;
    this.addAdviceForm.reset();
  }

  /**
  * Get advices for the visit
  * @returns {void}
  */
  checkIfAdvicePresent(): void {
    this.advices = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptAdvice)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            if (!obs.value.includes('</a>')) {
              this.advices.push(obs);
            }
          }
        });
      });
  }

  /**
  * Save advice
  * @returns {void}
  */
  addAdvice(): void {
    if (this.addAdviceForm.invalid) {
      return;
    }
    if (this.advices.find((o: ObsModel) => o.value === this.addAdviceForm.value.advice)) {
      this.toastr.warning(this.translateService.instant('Advice already added, please add another advice.'), this.translateService.instant('Already Added'));
      return;
    }
    this.advices.push({ value: this.addAdviceForm.value.advice });
    this.addAdviceForm.reset();

    // this.encounterService.postObs({
    //   concept: conceptIds.conceptAdvice,
    //   person: this.visit.patient.uuid,
    //   obsDatetime: new Date(),
    //   value: this.addAdviceForm.value.advice,
    //   encounter: this.visitNotePresent.uuid,
    // }).subscribe((response: ObsModel) => {

    // });
  }

  /**
  * Delete advice for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Advice obs uuid
  * @returns {void}
  */
  deleteAdvice(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.advices.splice(index, 1);
    });
  }

}
