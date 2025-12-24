import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, NO_ERRORS_SCHEMA, ViewChild, OnDestroy, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { AiddxLibraryModule, AiddxService, AiTxService, AillmddxComponent, AillmtxMedicationComponent, AillmtxAdviceComponent, AillmtxTestComponent, AillmtxFollowupComponent, AillmtxReferralComponent, ENVIRONMENT } from 'aiddx-library';
import { isFeaturePresent } from 'src/app/utils/utility-functions';
import { environment } from 'src/environments/environment';
import { AppConfigService } from 'src/app/services/app-config.service';
import { DiagnosticModel, DropdownItemModel, EncounterModel, ObsApiResponseModel, ObsModel, ReferralModel, TestModel } from 'src/app/model/model';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { DataItemModel, MedicineModel } from 'src/app/model/model';
import instructionRemarks from 'src/app/core/data/instructionRemarks';
import durationUnitList from 'src/app/core/data/durationUnitList';
import { conceptIds, days, facility, refer_prioritie } from 'src/config/constant';
import doses from '../../../core/data/dose';
import { VisitService } from 'src/app/services/visit.service';
import { EncounterService } from 'src/app/services/encounter.service';
import medicines from '../../../core/data/medicines';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslationService } from 'src/app/services/translation.service';
import * as moment from 'moment';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { formatDate } from '@angular/common';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';

export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

class PickDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd MMMM yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

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
    MatTooltipModule,
    NgSelectModule,
    TranslateModule,
    AiddxLibraryModule,
    NgbTypeaheadModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  providers: [
    AiddxService,
    AiTxService,
    { provide: ENVIRONMENT, useValue: environment },
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DiagnosisComponent implements OnInit, OnDestroy {
  @ViewChild(AillmddxComponent) aillmddxComponent: AillmddxComponent;
  @ViewChild(AillmtxMedicationComponent) aillmtxMedicationComponent: AillmtxMedicationComponent;
  @ViewChild(AillmtxAdviceComponent) aillmtxAdviceComponent: AillmtxAdviceComponent;
  @ViewChild(AillmtxTestComponent) aillmtxTestComponent: AillmtxTestComponent;
  @ViewChild(AillmtxReferralComponent) aillmtxReferralComponent: AillmtxReferralComponent;
  @ViewChild(AillmtxFollowupComponent) aillmtxFollowupComponent: AillmtxFollowupComponent;
  @Input() visit: any;
  @Input() patientInfo: any;
  @Output() diagnosisName: string;
  @Input() isMCCUser: boolean = false;
  @Input() isVisitNoteProvider: boolean = false;
  @Input() visitEnded: EncounterModel | string;
  @Input() patientInteractionNotesForm: FormGroup;
  @Output() diagnosisSaved = new EventEmitter<any>();
  @Output() medicationSaved = new EventEmitter<any>();
  @Output() adviceSaved = new EventEmitter<any>();
  @Output() testSaved = new EventEmitter<any>();
  @Output() referralSaved = new EventEmitter<any>();
  @Output() followUpSaved = new EventEmitter<any>();
  @Output() furtherQuestionsReceived = new EventEmitter<string[]>();
  @Output() diagnosisReceived = new EventEmitter<any>();

  diagnosisForm: FormGroup;
  diagnosisSecondaryForm: FormGroup;
  existingDiagnosis: any[] = [];
  existingMedication: any[] = [];
  existingAdvice: any[] = [];
  existingTest: any[] = [];
  existingReferral: any[] = [];
  existingFollowUp: any[] = [];
  addMoreDiagnosis: boolean = false;
  diagnosis$: Observable<any>;
  diagnosisValidated: boolean = false;
  private dSearchSubject = new Subject<string>();
  private diagnosisSubject = new Subject<any[]>();
  diagnosisCode: { value: string } = { value: '' };

  hasAILLMEnabled: boolean = false;

  medicines: MedicineModel[] = [];
  advices: ObsModel[] = [];
  additionalInstructions: ObsModel;
  daysList: DataItemModel[] = days.daysList
  durationUnitList: DataItemModel[] = durationUnitList;
  drugNameList: DataItemModel[] = [];
  advicesList: string[] = [];
  testsList: string[] = [];
  tests: TestModel[] = [];
  referrals: ReferralModel[] = [];

  addMedicineForm: FormGroup;
  additionalInstructionForm: FormGroup;
  addAdviceForm: FormGroup;
  addTestForm: FormGroup;
  testForm: FormGroup;
  addReferralForm: FormGroup;
  followUpForm: FormGroup;
  followUpDatetime: string;

  addMoreMedicine = false;
  addMoreAdvice = false;
  addMoreTest = false;
  addMoreReferral = false;

  visitNotePresent: EncounterModel;
  referralSecondaryForm: FormGroup;

  refer_priorities: DataItemModel[] = refer_prioritie.refer_priorities;
  facilities: DataItemModel[] = facility.facilities
  referSpecializations: DropdownItemModel[] = [];
  diagnostics: DiagnosticModel[] = [];
  timeList: string[] = [];
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    public appConfigService: AppConfigService,
    private diagnosisService: DiagnosisService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private visitService: VisitService,
    private encounterService: EncounterService,
    private translationService: TranslationService,
    private visitSummaryService: VisitSummaryHelperService,
    private aiTxService: AiTxService
  ) {
    this.diagnosisForm = this.fb.group({
      diagnosisName: ['', Validators.required],
      diagnosisType: ['', Validators.required],
      diagnosisStatus: ['', Validators.required],
      diagnosisAiGenerated: ['']
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

    this.addTestForm = new FormGroup({
      test: new FormControl(null, [Validators.required])
    });

    this.testForm = new FormGroup({
      uuid: new FormControl(null),
      test: new FormControl(null, [Validators.required])
    });

    this.addReferralForm = new FormGroup({
      facility: new FormControl(null, !this.isFeatureAvailable('referralFacility') ? [Validators.required] : []),
      speciality: new FormControl(null, [Validators.required]),
      priority_refer: new FormControl('Elective', !this.isFeatureAvailable('priorityOfReferral') ? [Validators.required] : []),
      reason: new FormControl(null)
    });

    this.followUpForm = new FormGroup({
      present: new FormControl(false, [Validators.required]),
      wantFollowUp: new FormControl('', [Validators.required]),
      followUpDate: new FormControl(null),
      followUpTime: new FormControl(null),
      followUpReason: new FormControl(null),
      uuid: new FormControl(null),
      followUpType: new FormControl(null)
    });


    this.diagnosis$ = this.diagnosisSubject.asObservable();
    this.referSpecializations = this.appConfigService?.dropdown_values?.['refer specialisation']?.filter((val) => val?.is_enabled);
    this.diagnostics = [...this.appConfigService.patient_diagnostics];
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
  search7 = (text$: Observable<string>) => this.mainSearch(text$, this.testsList);

  ngAfterViewInit(): void {
    this.formControlValueChanges();
    if (this.hasAILLMEnabled && this.aillmddxComponent) {
      this.aillmddxComponent.furtherQuestionsListReceived.subscribe((questions: string[]) => {
        if (questions && questions.length) {
          this.furtherQuestionsReceived.emit(questions);
        }
      });

      this.aillmddxComponent.diagnosisReceived.subscribe((diagnosisData:any) => {
        if (diagnosisData && diagnosisData.length) {
          this.diagnosisReceived.emit(diagnosisData);
        }
      });
    }
  }

  ngOnInit() {
    this.dSearchSubject.subscribe(val => {
      this.searchDiagnosis(val);
    });
    this.checkIfDiagnosisPresent();
    this.checkIfNotePresent();
    this.checkIfMedicationPresent();
    this.getAdvicesList();
    this.checkIfAdvicePresent();
    this.getTestsList();
    this.checkIfTestPresent();
    this.checkIfReferralPresent();
    this.checkIfFollowUpPresent();
    medicines.forEach(med => {
      this.drugNameList.push({ 'id': med.id, 'name': this.translateService.instant(med.name) });
    });

    // Initialize visit note encounter
    this.visitService.fetchVisitDetails(this.visit.uuid).subscribe((visit: any) => {
      if (visit && visit.encounters) {
        this.visitNotePresent = visit.encounters.find(({ display = '' }) => display.includes('Visit Note'));
      }
    });
  }

  ngOnDestroy() {
    // Clear the cache when component is destroyed
    this.aiTxService.clearCache();
  }

  /**
  * Subscribe to the form control value changes observables
  * @return {void}
  */
  formControlValueChanges(): void {
    this.followUpForm.get('wantFollowUp').valueChanges.subscribe((val: string) => {
      if (val === 'Yes' || val === 'Да') {
        this.followUpForm.get('followUpDate').setValidators(Validators.required);
        this.followUpForm.get('followUpDate').updateValueAndValidity();
        this.followUpForm.get('followUpTime').setValidators(Validators.required);
        this.followUpForm.get('followUpTime').updateValueAndValidity();
      } else {
        this.followUpForm.get('followUpDate').clearValidators();
        this.followUpForm.get('followUpDate').updateValueAndValidity();
        this.followUpForm.get('followUpTime').clearValidators();
        this.followUpForm.get('followUpTime').updateValueAndValidity();
      }
    });
    this.followUpForm.get('followUpDate').valueChanges.subscribe((val: string) => {
      if (val) {
        this.timeList = this.visitSummaryService.getHours(false, val);
      } else {
        this.timeList = [];
      }
    });
  }
  
  get selectedDiagnoses(): string[] {
    return this.aillmddxComponent?.selectedDiagnosis || [];
  }

  get selectedMedication(): any[] {
    return this.aillmtxMedicationComponent?.selectedMedicine || [];
  }

  get selectedAdvices(): string[] {
    return this.aillmtxAdviceComponent?.selectedAdvice || [];
  }

  get selectedTests(): string[] {
    return this.aillmtxTestComponent?.selectedTest || [];
  }

  get selectedReferrals(): string[] {
    return this.aillmtxReferralComponent?.selectedReferral || [];
  }

  get selectedFollowups(): any[] {
    return this.aillmtxFollowupComponent?.selectedFollowUp || [];
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
      this.diagnosisService.getSnomedCTDiagnosisList(val).subscribe({
        next: (response) => {
          if (response.data && response.data.length) {
            const data = [];
            response.data.forEach((element: { concept_name: any, snomedCTCode: any }) => {
              if (element) {
                data.push({ name: element?.concept_name, snomedCTCode: element?.snomedCTCode });
              }
            });
            this.diagnosisSubject.next(data);
          } else {
            if (this.appConfigService?.patient_visit_summary?.diagnosis_snomedct) {
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
    if (this.appConfigService?.patient_visit_summary?.diagnosis_snomedct) {
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
      else if (event.snomedCTCode) {
        this.diagnosisForm.addControl('diagnosisCode', new FormControl(null));
        this.diagnosisForm.patchValue({ diagnosisCode: event.snomedCTCode });
      }
    }
    if (this.selectedDiagnoses.length > 0) {
      this.onAIDiagnosisSelected();
    }
  }

  removeDiagnosis(diagnosis: string): void {
    this.onAIDiagnosisChange(diagnosis);
  }

  toggleDiagnosis(): void {
    this.addMoreDiagnosis = !this.addMoreDiagnosis;
    this.diagnosisForm.reset();
    this.selectedDiagnoses.splice(0, this.selectedDiagnoses.length);
  }

  saveDiagnosis(): void {
    if (this.selectedDiagnoses.length > 0) {
      this.diagnosisName = this.diagnosisForm.value.diagnosisName?.replace(/:/g, ' ');
      
      // Clear the cache before making new treatment calls
      this.aiTxService.clearCache();
      
      this.aillmtxMedicationComponent?.getAIMedicalWithRetry(this.diagnosisName);
      this.aillmtxAdviceComponent?.getAIAdviceWithRetry(this.diagnosisName);
      this.aillmtxTestComponent?.getAITestWithRetry(this.diagnosisName);
      this.aillmtxReferralComponent?.getAIReferralWithRetry(this.diagnosisName);
      this.aillmtxFollowupComponent?.getAIFollowUpWithRetry(this.diagnosisName);

      this.diagnosisSubject.next(this.selectedDiagnoses);
      const { diagnosisAiGenerated, ...restForm } = this.diagnosisForm.value;
      const newDiagnosis = { 
          ...restForm, 
          diagnosisName: this.diagnosisName, 
          ...(diagnosisAiGenerated ? { diagnosisAiGenerated: diagnosisAiGenerated } : {}),
      };
      this.existingDiagnosis.push(newDiagnosis);
      this.removeDiagnosis(this.diagnosisName);
      this.diagnosisForm.patchValue({ diagnosisName: this.selectedDiagnoses?.[0] || null });
      this.diagnosisForm.controls.diagnosisType.reset();
      this.diagnosisForm.controls.diagnosisStatus.reset();
      this.diagnosisSaved.emit(this.existingDiagnosis);
    }

    if (this.diagnosisForm.invalid || !this.isVisitNoteProvider || !this.diagnosisValidated) {
      return;
    }

    if (this.existingDiagnosis.find(o => o.diagnosisName.toLocaleLowerCase() === this.diagnosisForm.value.diagnosisName.toLocaleLowerCase())) {
      this.toastr.warning(this.translateService.instant('Diagnosis Already Exist'), this.translateService.instant('Duplicate Diagnosis'));
      return;
    }

    this.diagnosisName = this.diagnosisForm.value.diagnosisName?.replace(/:/g, ' ');
    
    // Clear the cache before making new treatment calls
    this.aiTxService.clearCache();
    
    this.aillmtxMedicationComponent?.getAIMedicalWithRetry(this.diagnosisName);
    this.aillmtxAdviceComponent?.getAIAdviceWithRetry(this.diagnosisName);
    this.aillmtxTestComponent?.getAITestWithRetry(this.diagnosisName);
    this.aillmtxReferralComponent?.getAIReferralWithRetry(this.diagnosisName);
    this.aillmtxFollowupComponent?.getAIFollowUpWithRetry(this.diagnosisName);

    const { diagnosisAiGenerated: _ignore, ...rest } = this.diagnosisForm.value;
    this.existingDiagnosis.push({ ...rest, diagnosisName: this.diagnosisName });
    this.diagnosisForm.reset();
    this.diagnosisSaved.emit(this.existingDiagnosis);
  }

  deleteDiagnosis(index: number, uuid: string): void {
    if (uuid) {
      this.diagnosisService.deleteObs(uuid).subscribe(() => {
        this.existingDiagnosis.splice(index, 1);
        this.diagnosisSaved.emit(this.existingDiagnosis);
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

  isFeatureAvailable(featureName: string, notInclude = false): boolean {
    return isFeaturePresent(featureName, notInclude);
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
    if (this.aillmddxComponent && this.aillmddxComponent.selectedDiagnosis) {
      // Clear existing selections
      this.selectedDiagnoses.length = 0;

      // Add selected diagnoses
      this.aillmddxComponent.selectedDiagnosis.forEach(diagnosis => {
        if (!this.isDiagnosisExists(diagnosis)) {
          this.selectedDiagnoses.push(diagnosis);
        }
      });

      // Update the form with the first diagnosis as the primary
      if (this.selectedDiagnoses.length > 0) {
        this.diagnosisForm.patchValue({
          diagnosisName: this.selectedDiagnoses[0],
          diagnosisAiGenerated: 'AI generated'
        });
      }

      // Emit further questions if available
      const furtherQuestions = this.aillmddxComponent.furtherQuestionsList || [];
      this.furtherQuestionsReceived.emit(furtherQuestions);
    }
  }

  removeMedicine(medicine: any): void {
    if (this.aillmtxMedicationComponent) {
      this.aillmtxMedicationComponent.onAIMedicineChange(medicine);
      if (this.selectedMedication.length === 0) {
        this.addMedicineForm.reset();
      } else {
        const nextMedicine = this.selectedMedication[0];
        if (nextMedicine) {
          this.addMedicineForm.patchValue({
            drug: nextMedicine.name,
            dose: nextMedicine.dosage,
            frequency: nextMedicine.frequency,
            durationNo: nextMedicine.duration,
            durationUnit: nextMedicine.duration_unit,
            instructRemark: nextMedicine.instructions
          });
        }
      }
    }
  }

  onAIMedicineSelected(): void {
    if (this.selectedMedication.length > 0) {
      const selectedMedicine = this.selectedMedication[0];
      this.addMedicineForm.patchValue({
        drug: selectedMedicine.name,
        dose: selectedMedicine.dosage,
        frequency: selectedMedicine.frequency,
        durationNo: selectedMedicine.duration,
        durationUnit: selectedMedicine.duration_unit,
        instructRemark: selectedMedicine.instructions
      });
    } else {
      this.addMedicineForm.reset();
    }
  }

  saveDDxNotes(): void {
    this.aillmddxComponent.getAIDiagnosis(this.patientInteractionNotesForm.value.value);
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
    this.additionalInstructionForm.reset();
    this.addMedicineForm.reset();
  }

  addMedicine(): void {
    if (this.selectedMedication.length > 0) {
      const medicine = this.selectedMedication[0];

      const formattedMedicine = {
        drug: this.addMedicineForm.value.drug,
        dose: this.addMedicineForm.value.dose,
        frequency: this.addMedicineForm.value.frequency,
        durationNo: this.addMedicineForm.value.durationNo,
        durationUnit: this.addMedicineForm.value.durationUnit,
        instructRemark: this.addMedicineForm.value.instructRemark || '',
        uuid: medicine.uuid
      };

      // Check for duplicates
      if (!this.medicines.find(m => m.drug.toLowerCase() === formattedMedicine.drug.toLowerCase())) {
        this.medicines.push(formattedMedicine);

        if (this.aillmtxMedicationComponent) {
          this.aillmtxMedicationComponent.existingMedication = [...this.medicines];
        }

        this.removeMedicine(medicine);
        this.medicationSaved.emit(this.medicines);

        if (this.selectedMedication.length > 0) {
          const nextMedicine = this.selectedMedication[0];
          if (nextMedicine) {
            this.addMedicineForm.patchValue({
              drug: nextMedicine.name,
              dose: nextMedicine.dosage,
              frequency: nextMedicine.frequency,
              durationNo: nextMedicine.duration,
              durationUnit: nextMedicine.duration_unit,
              instructRemark: nextMedicine.instructions
            });

            Object.keys(this.addMedicineForm.controls).forEach(key => {
              const control = this.addMedicineForm.get(key);
              control?.updateValueAndValidity();
            });
          }
        } else {
          this.addMedicineForm.reset();
        }
      } else {
        this.toastr.warning(this.translateService.instant('Medicine already added, please add another drug.'), this.translateService.instant('Already Added'));
      }
      return;
    }

    // Add manually entered medicine
    if (this.addMedicineForm.invalid || !this.isVisitNoteProvider) {
      return;
    }

    if (this.medicines.find(m => m.drug.toLowerCase() === this.addMedicineForm.value.drug.toLowerCase())) {
      this.toastr.warning(this.translateService.instant('Medicine already added, please add another drug.'), this.translateService.instant('Already Added'));
      return;
    }
    // Ensure instructRemark is never null
    const medicineData = { ...this.addMedicineForm.value };
    if (!medicineData.instructRemark) {
      medicineData.instructRemark = '';
    }

    this.medicines.push(medicineData);
    // this.medicines.push({ ...this.addMedicineForm.value });
    this.addMedicineForm.reset();
    this.medicationSaved.emit(this.medicines);
  }
  
  checkIfMedicationPresent(): void {
    this.medicines = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptMed).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (obs.value.includes(':') && !this.appConfigService?.patient_visit_summary?.dp_medication_secondary) {
            this.medicines.push(this.visitService.formatMedicineDisplay(obs.value, obs.uuid));
            if (this.aillmtxMedicationComponent) {
              this.aillmtxMedicationComponent.existingMedication = [...this.medicines];
            }
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
      if (this.aillmtxMedicationComponent) {
        this.aillmtxMedicationComponent.existingMedication = [...this.medicines];
      }
      this.medicationSaved.emit(this.medicines);
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
              if (this.aillmtxAdviceComponent) {
                this.aillmtxAdviceComponent.existingAdvice = [...this.advices];
              }
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
    if (this.selectedAdvices.length > 0) {
      const advice = this.selectedAdvices[0];
      if (!this.advices.find((o: ObsModel) => o.value === advice)) {
        this.advices.push({ value: advice });
        if (this.aillmtxAdviceComponent) {
          this.aillmtxAdviceComponent.existingAdvice = [...this.advices];
        }
        this.removeAdvice(advice);
        this.adviceSaved.emit(this.advices);
      } else {
        this.toastr.warning(this.translateService.instant('Advice already added, please add another advice.'), this.translateService.instant('Already Added'));
      }
      return;
    }

    if (this.addAdviceForm.invalid) {
      return;
    }
    if (this.advices.find((o: ObsModel) => o.value === this.addAdviceForm.value.advice)) {
      this.toastr.warning(this.translateService.instant('Advice already added, please add another advice.'), this.translateService.instant('Already Added'));
      return;
    }
    this.advices.push({ value: this.addAdviceForm.value.advice });
    this.addAdviceForm.reset();
    this.adviceSaved.emit(this.advices);
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
      if (this.aillmtxAdviceComponent) {
        this.aillmtxAdviceComponent.existingAdvice = [...this.advices];
      }
      this.adviceSaved.emit(this.advices);
    });
  }

  onAIAdviceSelected(): void {
    if (this.selectedAdvices.length > 0) {
      const selectedAdvice = this.selectedAdvices[0];
      this.addAdviceForm.patchValue({ advice: selectedAdvice });
    } else {
      this.addAdviceForm.reset();
    }
  }

  removeAdvice(advice: string): void {
    if (this.aillmtxAdviceComponent) {
      this.aillmtxAdviceComponent.onAIAdviceChange(advice);
      if (this.selectedAdvices.length === 0) {
        this.addAdviceForm.reset();
      } else {
        const nextAdvice = this.selectedAdvices[0];
        if (nextAdvice) {
          this.addAdviceForm.patchValue({ advice: nextAdvice });
        }
      }
    }
  }

  /**
  * Get tests list
  * @returns {void}
  */
  getTestsList(): void {
    this.diagnosisService.concept(conceptIds.conceptInvestigationsTest).subscribe(res => {
      const result = res.answers;
      result.forEach((ans: { display: string; }) => {
        this.testsList.push(this.translationService.getDropdownTranslation('tests', ans.display));
      });
    });
  }

  /**
  * Toggle test add form, show/hide add more test button
  * @returns {void}
  */
  toggleTest() {
    this.addMoreTest = !this.addMoreTest;
    this.addTestForm.reset();
  }

  /**
  * Get tests for the visit
  * @returns {void}
  */
  checkIfTestPresent(): void {
    this.tests = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptTest)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            if(this.appConfigService.patient_visit_summary.dp_investigations_secondary) {
              this.testForm.patchValue({uuid:obs.uuid, test:obs.value})
            } else {
              this.tests.push(obs);
              if (this.aillmtxTestComponent) {
                this.aillmtxTestComponent.existingTest = [...this.tests];
              }
            }
          }
        });
      });
  }

  /**
  * Add test
  * @returns {void}
  */
  addTest(): void {
    if (this.selectedTests.length > 0) {
      const test = this.selectedTests[0];
      if (!this.tests.find((o: TestModel) => o.value === test)) {
        const newTest: TestModel = { value: test, uuid: null };
        this.tests.push(newTest);
        if (this.aillmtxTestComponent) {
          this.aillmtxTestComponent.existingTest = [...this.tests];
        }
        this.removeTest(test);
        this.testSaved.emit(this.tests);
      } else {
        this.toastr.warning(this.translateService.instant('Test already added, please add another test.'), this.translateService.instant('Already Added'));
      }
      return;
    }
    if (this.addTestForm.invalid) {
      return;
    }
    const testValue = this.addTestForm.value.test;
    if (this.tests.find((o: TestModel) => o.value === testValue)) {
      this.toastr.warning(this.translateService.instant('Test already added, please add another test.'), this.translateService.instant('Already Added'));
      return;
    }
    const newTest: TestModel = { value: testValue, uuid: null };
    this.tests.push(newTest);
    this.addTestForm.reset();
    this.testSaved.emit(this.tests);
  }

  /**
  * Delete test for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Test obs uuid
  * @returns {void}
  */
  deleteTest(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.tests.splice(index, 1);
      if (this.aillmtxTestComponent) {
        this.aillmtxTestComponent.existingTest = [...this.tests];
      }
      this.testSaved.emit(this.tests);
    });
  }

  onAITestSelected(): void {
    if (this.selectedTests.length > 0) {
      const selectedTest = this.selectedTests[0];
      this.addTestForm.patchValue({ test: selectedTest });
    } else {
      this.addTestForm.reset();
    }
  }

  removeTest(test: string): void {
    if (this.aillmtxTestComponent) {
      this.aillmtxTestComponent.onAITestChange(test);
      if (this.selectedTests.length === 0) {
        this.addTestForm.reset();
      } else {
        const nextTest = this.selectedTests[0];
        if (nextTest) {
          this.addTestForm.patchValue({ test: nextTest });
        }
      }
    }
  }

  /**
  * Toggle referral add form, show/hide add more referral button
  * @returns {void}
  */
  toggleReferral(): void {
    this.addMoreReferral = !this.addMoreReferral;
    this.addReferralForm.reset();
  }

  /**
  * Get referrals for the visit
  * @returns {void}
  */
  checkIfReferralPresent(): void {
    this.referrals = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptReferral)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          const obs_values = obs.value.split(':');
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid && obs_values.length > 1 && !this.appConfigService?.patient_visit_summary?.dp_referral_secondary) {
            this.referrals.push({ uuid: obs.uuid, speciality: obs_values[0].trim(), facility: obs_values[1].trim(), priority: obs_values[2].trim(), reason: obs_values[3].trim() ? obs_values[3].trim() : '-' });
            if (this.aillmtxReferralComponent) {
              this.aillmtxReferralComponent.existingReferral = [...this.referrals];
            }
          } else if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.referralSecondaryForm.patchValue({ uuid: obs.uuid, ref: obs.value })
          }
        });
      });
  }

  /**
  * Save referral
  * @returns {void}
  */
  addReferral(): void {
    if (this.selectedReferrals.length > 0) {
      const selectedReferral = this.selectedReferrals[0] as any;
      const refer_reason = selectedReferral.remark ? selectedReferral.remark : '';
      const formattedReferral = { 
        speciality: selectedReferral.referral_to, 
        facility: selectedReferral.referral_facility, 
        priority: 'Elective', 
        reason: refer_reason
      };

      if(!this.referrals.find((o: ReferralModel) => o.speciality === formattedReferral.speciality)) {
        this.referrals.push(formattedReferral);
        if (this.aillmtxReferralComponent) {
          this.aillmtxReferralComponent.existingReferral = [...this.referrals];
        }
        this.addReferralForm.controls.priority_refer.setValue('Elective');
        this.removeReferral(selectedReferral);
        this.referralSaved.emit(this.referrals);
      } else {
        this.toastr.warning(this.translateService.instant('Referral already added, please add another referral.'), this.translateService.instant('Already Added'));
      }
      return;
    }

    if (this.addReferralForm.invalid || !this.isVisitNoteProvider) {
      return;
    }

    if (this.referrals.find((o: ReferralModel) => o.speciality === this.addReferralForm.value.speciality)) {
      this.toastr.warning(this.translateService.instant('Referral already added, please add another referral.'), this.translateService.instant('Already Added'));
      return;
    }

    const refer_reason = this.addReferralForm.value.reason ? this.addReferralForm.value.reason : '';
    this.referrals.push({ 
      speciality: this.addReferralForm.value.speciality, 
      facility: this.addReferralForm.value.facility, 
      priority: this.addReferralForm.value.priority_refer, 
      reason: refer_reason 
    });
    this.addReferralForm.reset();
    this.addReferralForm.controls.priority_refer.setValue('Elective');
    this.referralSaved.emit(this.referrals);
  }

  /**
  * Delete referral for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Referral obs uuid
  * @returns {void}
  */
  deleteReferral(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.referrals.splice(index, 1);
      if (this.aillmtxReferralComponent) {
        this.aillmtxReferralComponent.existingReferral = [...this.referrals];
      }
      this.referralSaved.emit(this.referrals);
    });
  }

  onAIReferralSelected(): void {
    if (this.selectedReferrals.length > 0) {
      const selectedReferral = this.selectedReferrals[0] as any;
      this.addReferralForm.patchValue({
        speciality: selectedReferral.referral_to,
        facility: selectedReferral.referral_facility,
        priority_refer: selectedReferral.priority || 'Elective',
        reason: selectedReferral.remark
      });
    } else {
      this.addReferralForm.reset();
      this.addReferralForm.controls.priority_refer.setValue('Elective');
    }
  }

  removeReferral(referral: any): void {
    if (this.aillmtxReferralComponent) {
      this.aillmtxReferralComponent.onAIReferralChange(referral);
      if (this.selectedReferrals.length === 0) {
        this.addReferralForm.reset();
        this.addReferralForm.controls.priority_refer.setValue('Elective');
      }
    }
  }

  /**
  * Get followup for the visit
  * @returns {void}
  */
  checkIfFollowUpPresent(): void {
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptFollow).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          let followUpDate: string, followUpTime: any, followUpReason: any, wantFollowUp: string = 'No', followUpType: any;
          if (obs.value.includes('Time:')) {
            const result = obs.value.split(',').filter(Boolean);
            const time = result.find((v: string) => v.includes('Time:'))?.split('Time:')?.[1]?.trim();
            const remark = result.find((v: string) => v.includes('Remark:'))?.split('Remark:')?.[1]?.trim();
            followUpDate = moment(result[0]).format('YYYY-MM-DD');
            followUpTime = time ? time : null;
            followUpReason = (remark && remark !=="null") ? remark : null;
            wantFollowUp = 'Yes';

            // Only try to get Type if the feature is enabled
            if (this.isFeatureAvailable('followUpType')) {
              const type = result.find((v: string) => v.includes('Type:'))?.split('Type:')?.[1]?.trim();
              followUpType = type && type !== 'null' ? type : null;
            }
          }
          this.followUpDatetime = obs.value;
          this.followUpForm.patchValue({
            present: true,
            wantFollowUp,
            followUpDate,
            followUpTime,
            followUpReason,
            uuid: obs.uuid,
            followUpType: this.isFeatureAvailable('followUpType') ? followUpType : null
          });

          if (this.aillmtxFollowupComponent) {
            this.aillmtxFollowupComponent.existingFollowUp = [{
              present: true,
              wantFollowUp,
              followUpDate,
              followUpTime,
              followUpReason,
              uuid: obs.uuid,
              followUpType: this.isFeatureAvailable('followUpType') ? followUpType : null
            }];
          }
        }
      });
    });
  }

  /**
  * Save followup
  * @returns {Observable<any>}
  */
  saveFollowUp(): Observable<any> {
    if (this.followUpForm.value.wantFollowUp === 'Yes') {
      const value = `${moment(this.followUpForm.value.followUpDate).format('YYYY-MM-DD')},Time:${this.followUpForm.value.followUpTime},Remark:${this.followUpForm.value.followUpReason}${this.isFeatureAvailable('followUpType') ? ',Type:' + (this.followUpForm.value.followUpType) : ''}`;
      
      if (this.followUpForm.value.uuid) {
        return this.encounterService.updateObs(this.followUpForm.value.uuid, { value });
      } else {
        if (this.aillmtxFollowupComponent) {
          this.aillmtxFollowupComponent.existingFollowUp.push({
            present: true,
            wantFollowUp: 'Yes',
            followUpDate : this.followUpForm.value.followUpDate,
            followUpTime : this.followUpForm.value.followUpTime,
            followUpReason : this.followUpForm.value.followUpReason,
            followUpType : this.isFeatureAvailable('followUpType') ? this.followUpForm.value.followUpType : null
          });
        }
        this.encounterService.postObs({
          concept: conceptIds.conceptFollow,
          person: this.visit.patient.uuid,
          obsDatetime: new Date(),
          value: value,
          encounter: this.visitNotePresent.uuid
        }).subscribe ( (res) => {
            this.followUpForm.patchValue({
            present: true,
            wantFollowUp: 'Yes',
            followUpDate : this.followUpForm.value.followUpDate,
            followUpTime : this.followUpForm.value.followUpTime,
            followUpReason : this.followUpForm.value.followUpReason,
            uuid: res.uuid,
            followUpType : this.isFeatureAvailable('followUpType') ? this.followUpForm.value.followUpType : null
          });
        });
        this.followUpSaved.emit(this.followUpForm.value);
      }
    } else {
      this.encounterService.postObs({
        concept: conceptIds.conceptFollow,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: this.followUpForm.value.wantFollowUp,
        encounter: this.visitNotePresent.uuid
      }).subscribe ( (res) => {
          this.followUpForm.patchValue({
            present: true,
            wantFollowUp: 'No',
            followUpDate : null,
            followUpTime : null,
            followUpReason :null,
            uuid: res.uuid,
            followUpType : this.isFeatureAvailable('followUpType') ? this.followUpForm.value.followUpType : null
          });
          if (this.aillmtxFollowupComponent) {
            this.aillmtxFollowupComponent.existingFollowUp.push({
              present: true,
              wantFollowUp: 'No',
              followUpDate : null,
              followUpTime : null,
              followUpReason : null,
              followUpType : this.isFeatureAvailable('followUpType') ? this.followUpForm.value.followUpType : null
            });
          }
      });
      this.followUpSaved.emit(this.followUpForm.value);
    }
  }

  /**
  * Delete followup
  * @returns {void}
  */
  deleteFollowUp(): void {
    this.diagnosisService.deleteObs(this.followUpForm.value.uuid).subscribe(() => {
      const followUp = { present: false, uuid: null, wantFollowUp: '', followUpDate: null, followUpTime: null, followUpReason: null, followUpType: null }
      this.followUpForm.patchValue(followUp);
      this.followUpDatetime = null;
      if (this.aillmtxFollowupComponent) {
        this.aillmtxFollowupComponent.existingFollowUp = [];
        this.aillmtxFollowupComponent.selectedFollowUp = [];
      }
      this.followUpSaved.emit(followUp);
    });
  }

  onAIFollowUpSelected(): void {
    if(this.aillmtxFollowupComponent.existingFollowUp.length === 0){
      this.setSelectedFollowUp();
    } else {
      this.diagnosisService.deleteObs(this.aillmtxFollowupComponent.existingFollowUp[0]?.uuid).subscribe(() => {
      this.aillmtxFollowupComponent.existingFollowUp = [];
      this.followUpForm.reset();
      this.setSelectedFollowUp();
      });
    }
  }

  setSelectedFollowUp() {
      const selectedFollowUp = this.selectedFollowups[0];
      if (this.selectedFollowups.length > 0 && selectedFollowUp.follow_up_duration && selectedFollowUp.reason_for_follow_up) {
        const daysToAdd = this.convertDurationToDays(selectedFollowUp.follow_up_duration);
        if (selectedFollowUp.follow_up_required) {
          this.followUpForm.patchValue({
            present: false,
            wantFollowUp: 'Yes',
            followUpDate: moment().add(daysToAdd, 'days').toDate(),
            followUpTime: '10:00 AM',
            followUpReason: selectedFollowUp.reason_for_follow_up,
            followUpType: null
          });
        }
      }else {
        this.followUpForm.reset();
      }
    }
  
  convertDurationToDays(durationString) {
    // Match number and unit (week/day/month) from the input string
    const durationMatch = durationString.match(/(\d+)\s*(week|day|month)/i);
    let days = 7;

    if (durationMatch) {
      const number = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();

      switch (unit) {
        case 'week':
          days = number * 7;
          break;
        case 'month':
          days = number * 30;
          break;
        case 'day':
          days = number;
          break;
      }
    }
    return days;
  }

  removeFollowUp(follow: string): void {
    if (this.aillmtxFollowupComponent) {
      this.aillmtxFollowupComponent.onAIFollowUpChange(follow);
      if (this.selectedFollowups.length === 0) {
        this.followUpForm.reset();
        Object.keys(this.followUpForm.controls).forEach(key => {
          const control = this.followUpForm.get(key);
          control?.clearValidators();
          control?.updateValueAndValidity();
        });
      }
    }
  }

  isDiagnosisExists(diagnosis: string): boolean {
    return this.existingDiagnosis.some(d => 
      d.diagnosisName.trim().toLowerCase() === diagnosis.trim().toLowerCase()
    );
  }

  isDiagnosisSelected(diagnosis: string): boolean {
    return this.selectedDiagnoses.includes(diagnosis) || 
           this.existingDiagnosis.some(d => 
             d?.diagnosisName.trim().toLowerCase() === diagnosis.trim().toLowerCase()
           );
  }

  onAIDiagnosisChange(diagnosis: string): void {
    if (!diagnosis) {
      this.aillmddxComponent?.selectedDiagnosis?.length && (this.aillmddxComponent.selectedDiagnosis.length = 0);
    } else {
      const normDiagnosis = diagnosis.trim().toLowerCase();
      const index = this.selectedDiagnoses.findIndex(
        d => d.trim().toLowerCase() === normDiagnosis
      );

      index > -1
        ? this.selectedDiagnoses.splice(index, 1)
        : this.selectedDiagnoses.push(diagnosis);
    }

    if (this.selectedDiagnoses.length > 0) {
      this.diagnosisForm.patchValue({
        diagnosisName: this.selectedDiagnoses[0],
        diagnosisAiGenerated: 'AI generated'
      });
    } else {
      this.diagnosisForm.reset();
      ['diagnosisCode', 'isSnomed'].forEach(control => {
        if (this.diagnosisForm.contains(control)) {
          this.diagnosisForm.removeControl(control);
        }
      });
    }

    if (this.aillmddxComponent) {
      this.aillmddxComponent.selectedDiagnosis = [...this.selectedDiagnoses];
    }
  }
}

