import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/services/appointment.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { AbstractControl, FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { MindmapService } from 'src/app/services/mindmap.service';
import { MatAccordion } from '@angular/material/expansion';
import medicines from '../../core/data/medicines';
import { BehaviorSubject, forkJoin, interval, Observable, of, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import { formatDate } from '@angular/common';
import { LinkService } from 'src/app/services/link.service';
import { MatDialogRef } from '@angular/material/dialog';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from 'src/app/services/translation.service';
import { calculateBMI, deleteCacheData, getCacheData, getFieldValueByLanguage, setCacheData, isFeaturePresent, getCallDuration, autoGrowTextZone, autoGrowAllTextAreaZone, obsStringify, obsParse} from 'src/app/utils/utility-functions';
import { doctorDetails, languages, visitTypes, facility, refer_specialization, refer_prioritie, strength, days, timing, PICK_FORMATS, conceptIds, visitAttributeTypes } from 'src/config/constant';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';
import { ApiResponseModel, DataItemModel, DiagnosisModel, DiagnosticModel, DocImagesModel, EncounterModel, EncounterProviderModel, MedicineModel, ObsApiResponseModel, ObsModel, PatientHistoryModel, PatientIdentifierModel, PatientModel, PatientVisitSection, PatientVisitSummaryConfigModel, PersonAttributeModel, ProviderAttributeModel, ProviderModel, RecentVisitsApiResponseModel, ReferralModel, SpecializationModel, TestModel, VisitAttributeModel, VisitModel, VitalModel, DiagnosticUnit, DiagnosticName } from 'src/app/model/model';
import { AppConfigService } from 'src/app/services/app-config.service';
import { checkIsEnabled, VISIT_SECTIONS } from 'src/app/utils/visit-sections';
import { NgSelectComponent } from '@ng-select/ng-select';
import { NgxRolesService } from 'ngx-permissions';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FollowUpInstructionComponent } from './follow-up-instruction/follow-up-instruction.component';
import { NotesComponent } from './notes/notes.component';
import { keepOnlyPairedEvents } from 'src/app/utils/paired-events';

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
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class VisitSummaryComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('visitNoteDiv') visitNoteDiv: ElementRef;
  visit: VisitModel;
  patient: PatientModel;
  baseURL: string = environment.baseURL;
  visitAppointment: string;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  vitalObs: ObsModel[] = [];
  cheifComplaints: string[] = [];
  checkUpReasonData: PatientHistoryModel[] = [];
  physicalExaminationData: PatientHistoryModel[] = [];
  patientHistoryData: PatientHistoryModel[] = [];

  additionalDocs: DocImagesModel[] = [];
  eyeImages: DocImagesModel[] = [];
  medicines: MedicineModel[] = [];
  existingDiagnosis: DiagnosisModel[] = [];
  advices: ObsModel[] = [];
  additionalInstructions: ObsModel;
  tests: TestModel[] = [];
  referrals: ReferralModel[] = [];
  pastVisits: VisitModel[] = [];
  minDate = new Date();
  selectedTabIndex = 0;
  facilities: DataItemModel[] = facility.facilities
  specializations: SpecializationModel[] = [];
  refer_specializations: DataItemModel[] = refer_specialization.refer_specializations
  refer_priorities: DataItemModel[] = refer_prioritie.refer_priorities;
  strengthList: DataItemModel[] = strength.strengthList
  daysList: DataItemModel[] = days.daysList
  timingList: DataItemModel[] = timing.timingList
  timeList: string[] = [];
  drugNameList: DataItemModel[] = [];
  advicesList: string[] = [];
  testsList: string[] = [];

  visitEnded: EncounterModel | string;
  visitCompleted: EncounterModel | boolean;
  visitNotePresent: EncounterModel;
  isVisitNoteProvider = false;
  referSpecialityForm: FormGroup;
  provider: ProviderModel;
  showAll = true;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  addMoreMedicine = false;
  addMoreAdvice = false;
  addMoreTest = false;
  addMoreReferral = false;
  addMoreDiagnosis = false;

  hwInteractionUuid: String;
  patientInteractionUuid: String;
  patientCallStatusForm: FormGroup;
  diagnosisForm: FormGroup;
  addMedicineForm: FormGroup;
  additionalInstructionForm: FormGroup;
  addAdviceForm: FormGroup;
  addTestForm: FormGroup;
  testForm: FormGroup;
  addReferralForm: FormGroup;
  followUpForm: FormGroup;
  followUpDatetime: string;

  displayedColumns: string[] = ['action', 'created_on', 'consulted_by', 'cheif_complaint', 'summary', 'prescription', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();

  diagnosisSubject: BehaviorSubject<any>;
  diagnosis$: Observable<any>;
  private dSearchSubject: Subject<string> = new Subject();
  diagnosisValidated: boolean = false;

  dialogRef1: MatDialogRef<ChatBoxComponent>;
  dialogRef2: MatDialogRef<VideoCallComponent>;
  currentComplaint: string;

  additionalNotes = '';
  isCalling: boolean = false;

  openChatFlag: boolean = false;


  patientRegFields: string[] = [];
  vitals: VitalModel[] = [];
  diagnostics: DiagnosticModel[] = [];
  patientVisitSummary: PatientVisitSummaryConfigModel;
  pvsConfigs: PatientVisitSection[] = [];
  pvsConstant = VISIT_SECTIONS;

  hasChatEnabled: boolean = false;
  hasVideoEnabled: boolean = false;
  hasWebRTCEnabled: boolean = false;
  hasVitalsEnabled: boolean = false;
  hasPatientAddressEnabled: boolean = false;
  hasPatientOtherEnabled: boolean = false;

  collapsed: boolean = false;
  isMCCUser: boolean = false;
  brandName = environment.brandName === 'KCDO';
  diagnosticList;
  sanitizedValue: SafeHtml;
  changedFields: any;
  editFormValues: boolean = false;
  public changesMade: boolean = false;
  public isCallInProgress: boolean = false;
  callTimerInterval: Subscription;
  callDuration: number = 0;
  arrCallDurations: any[] = [];
  callDurationTimeStamp: number;
  callDurationsUuid: string;
  updatedObsData: any;
  diagnosisSecondaryForm: FormGroup;
  discussionSummaryForm: FormGroup;
  recommendationForm: FormGroup;
  @ViewChild(FollowUpInstructionComponent) followUpInstructionComponentRef: FollowUpInstructionComponent;
  @ViewChild('familyHistoryNote') familyHistoryNoteRef: NotesComponent;
  @ViewChild('pastMedicalHistoryNote') pastMedicalHistoryNoteRef: NotesComponent;
  @ViewChild('notes') notesRef: NotesComponent;
  genderData: any = {"M":"Male", "F":"Female", "O":"Other"}
  patientInteractionCommentForm: FormGroup
  isWhatsappCallWarningShown = false;

  reasons = {
    'Completed': [
      { name: 'Call closed. No further action from TMH team' },
      { name: 'To Repeat after Radiology/Pathology review (chargeable)' },
      { name: 'To Send Protocol Letter (chargeable)' }
    ],
    'Reschedule/Repeat Internally': [
      { name: 'Could not connect or Poor Network' },
      { name: 'Other discipline doctor could not be available' },
      { name: 'Patient to share Reports/ Scan Images/Video of Investigations' },
      { name: 'Repeat call with another DMG/Discipline (Non Chargeable)' },
      { name: 'Incomplete Visits' },
      { name: 'No Prescription' }
    ],
    'Close Call without Completion': [
      { name: 'Could not connect for attempts on 2 or more different days' },
      { name: 'Patient Not willing' },
      { name: 'Not found suitable for Tele-consult' },
      { name: 'Patient already visited the hospital' }
    ]
  };

  @ViewChild('reasonSelect', { static: false }) reasonSelectComponent: NgSelectComponent;
  reasonsList: { name: string }[] = [];

  frequencyList = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Every 30 minutes", "Every hour", "Every four hours", "Every eight hours"];

  mainSearch = (text$: Observable<string>, list: string[]) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : list.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )

  search = (text$: Observable<string>) => this.mainSearch(text$, this.advicesList);
  search2 = (text$: Observable<string>) => this.mainSearch(text$, this.testsList);
  search3 = (text$: Observable<string>) => this.mainSearch(text$, this.drugNameList.map((val) => val.name));
  search4 = (text$: Observable<string>) => this.mainSearch(text$, this.strengthList.map((val) => val.name));
  search5 = (text$: Observable<string>) => this.mainSearch(text$, this.daysList.map((val) => val.name));
  search6 = (text$: Observable<string>) => this.mainSearch(text$, this.timingList.map((val) => val.name));

  // Add this property to the component class
  obsData = {
    notes: [],
    familyHistoryNote: [],
    pastMedicalHistoryNote: [], 
    followUp: false,
    followUpInstruction: false,  // Changed to boolean
    diagnosis: [],
    addMedicine: [],
    additionalInstruction: null,
    addAdvice: [],
    addTests: [],
    test: null,
    addReferral: [],
    discussionSummary: null,
    patientCallStatus: null,
    diagnosisSecondary: null,
    recommendation: null,
    patientInteractionComment: null,
    hwInteraction: null,
    patientInteraction: null,
    medicine: []
  };

  private _hwInteraction: string;
  private _patientInteraction: string;

  get hwInteraction(): string {
    return this._hwInteraction;
  }

  set hwInteraction(value: string) {
    if (this._hwInteraction !== value) {
      this._hwInteraction = value;
      this.updatedObsData.hwInteraction = true;
      this.checkChanges(this.updatedObsData);
    }
  }

  get patientInteraction(): string {
    return this._patientInteraction;
  }

  set patientInteraction(value: string) {
    if (this._patientInteraction !== value) {
      this._patientInteraction = value;
      this.updatedObsData.patientInteraction = true;
      this.checkChanges(this.updatedObsData);
    }
  }

  eventLog: any[] = [];
  eventLogAttributeUuid: string;

  constructor(
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private appointmentService: AppointmentService,
    private diagnosisService: DiagnosisService,
    private toastr: ToastrService,
    private coreService: CoreService,
    private encounterService: EncounterService,
    private linkSvc: LinkService,
    private translateService: TranslateService,
    private translationService: TranslationService,
    private visitSummaryService: VisitSummaryHelperService,
    private mindmapService: MindmapService,
    public appConfigService: AppConfigService,
    private rolesService: NgxRolesService,
    private sanitizer: DomSanitizer) {
    Object.keys(this.appConfigService.patient_registration).forEach(obj => {
      this.patientRegFields.push(...this.appConfigService.patient_registration[obj].filter((e: { is_enabled: any; }) => e.is_enabled).map((e: { name: any; }) => e.name));
    });

    this.vitals = [...this.appConfigService.patient_vitals];
    this.diagnostics = this.appConfigService.patient_diagnostics_section ? [...this.appConfigService.patient_diagnostics] : [];
    this.specializations = [...this.appConfigService.specialization];
    this.patientVisitSummary = { ...this.appConfigService.patient_visit_summary };
    this.openChatFlag = this.router.getCurrentNavigation()?.extras?.state?.openChat;

    this.referSpecialityForm = new FormGroup({
      refer: new FormControl(false, [Validators.required]),
      specialization: new FormControl(null, [Validators.required])
    });

    this.patientCallStatusForm = new FormGroup({
      uuid: new FormControl(null),
      reason: new FormControl(null, []),
      callStatus: new FormControl(null, []),
    });

    this.diagnosisForm = new FormGroup({
      diagnosisName: new FormControl(null, Validators.required),
      diagnosisType: new FormControl(null, Validators.required),
      diagnosisStatus: new FormControl(null, Validators.required),
    });

    this.addMedicineForm = new FormGroup({
      drug: new FormControl(null, [Validators.required]),
      strength: new FormControl(null, [Validators.required]),
      days: new FormControl(null, [Validators.required]),
      timing: new FormControl(null, [Validators.required]),
      frequency: new FormControl(null),
      remark: new FormControl('', [])
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
      facility: new FormControl(null, !this.isFeatureAvailable('referralFacility') ? [Validators.required]: []),
      speciality: new FormControl(null, [Validators.required]),
      priority_refer: new FormControl('Elective', !this.isFeatureAvailable('priorityOfReferral') ? [Validators.required]: []),
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

    this.recommendationForm = new FormGroup({
      uuid: new FormControl(null),
      value: new FormControl(null, [Validators.required])
    })

    this.diagnosisSecondaryForm = new FormGroup({
      uuid: new FormControl(null),
      diagnosis: new FormControl(null, [Validators.required]),
      type: new FormControl(null),
      tnm: new FormControl(null),
      otherStaging: new FormControl(null)
    })

    this.discussionSummaryForm = new FormGroup({
      uuid: new FormControl(null),
      value: new FormControl(null, [Validators.required])
    })

    this.patientInteractionCommentForm = new FormGroup({
      uuid: new FormControl(null),
      value: new FormControl(null, [Validators.required])
    })

    this.diagnosisSubject = new BehaviorSubject<any[]>([]);
    this.diagnosis$ = this.diagnosisSubject.asObservable();

    this.hasWebRTCEnabled = this.appConfigService?.webrtc_section;
    this.hasChatEnabled = this.appConfigService?.webrtc?.chat;
    this.hasVideoEnabled = this.appConfigService?.webrtc?.video_call;
    this.hasVitalsEnabled = this.appConfigService?.patient_vitals_section;
    this.hasPatientAddressEnabled = this.appConfigService?.patient_reg_address;
    this.hasPatientOtherEnabled = this.appConfigService?.patient_reg_other;

    if(!this.appConfigService.patient_diagnostics_section) {
      this.appConfigService.patient_visit_sections = this.appConfigService.patient_visit_sections.filter((e: PatientVisitSection) => e.key !== 'diagnostics');
    }
    this.pvsConfigs = this.appConfigService.patient_visit_sections;
    this.isMCCUser = !!this.rolesService.getRole('ORGANIZATIONAL:MCC');
  }
  
  ngAfterViewInit(): void {
    this.formControlValueChanges();
    this.trackFormChanges();
    setTimeout(()=>{
      if(this.visitNoteDiv) autoGrowAllTextAreaZone(this.visitNoteDiv.nativeElement.querySelectorAll('textarea'));
    },2000)
  }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = getCacheData(true, doctorDetails.PROVIDER);
    medicines.forEach(med => {
      this.drugNameList.push({ 'id': med.id, 'name': this.translateService.instant(med.name) });
    });
    
    // Reset changed fields and disable save as draft on page refresh
    this.updatedObsData = {...this.obsData};
    this.changesMade = false;
    
    this.getVisit(id);
    // this.formControlValueChanges();
    this.dSearchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(searchTextValue => {
      this.searchDiagnosis(searchTextValue);
    });
  }

  /**
   * Watch for changes in hwInteraction and patientInteraction
   */
  private watchInteractionChanges() {
    // Create getters/setters for hwInteraction
    let hwInteractionValue = this.hwInteraction;
    Object.defineProperty(this, 'hwInteraction', {
      get: function() { return hwInteractionValue; },
      set: function(value) {
        if (value !== hwInteractionValue) {
          this.updatedObsData.hwInteraction = true;
          this.checkChanges(this.updatedObsData);
        }
        hwInteractionValue = value;
      }
    });

    // Create getters/setters for patientInteraction  
    let patientInteractionValue = this.patientInteraction;
    Object.defineProperty(this, 'patientInteraction', {
      get: function() { return patientInteractionValue; },
      set: function(value) {
        if (value !== patientInteractionValue) {
          this.updatedObsData.patientInteraction = true;
          this.checkChanges(this.updatedObsData);
        }
        patientInteractionValue = value;
      }
    });
  }

  checkOpenChatBoxFlag() {
    if (this.openChatFlag && this.hasWebRTCEnabled && this.hasChatEnabled) {
      setTimeout(() => {
        this.startChat();
      }, 1000);
    }
  }

  /**
  * Subscribe to the form control value changes observables
  * @return {void}
  */
  formControlValueChanges(): void {
   
    this.referSpecialityForm.get('refer').valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.referSpecialityForm.get(doctorDetails.SPECIALIZATION).setValue(null);
      }
    });

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

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @return {void}
  */
  getVisit(uuid: string): void {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: VisitModel) => {
      if (visit) {
        setTimeout(()=>{
          this.editFormValues = true;
        },2000)
        this.visit = visit;
        if (this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED)) {
          this.visit['visitUploadTime'] = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED) ? this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED)['encounterDatetime'] : null;
        } else if (this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.ADULTINITIAL) || this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VITALS)) {
          this.visit['visitUploadTime'] = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.FLAGGED) ? this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.ADULTINITIAL)['encounterDatetime'] : null;
        }
        this.checkVisitStatus(visit.encounters);
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: PatientModel) => {
          if (patient) {
            this.patient = patient;
            this.clinicName = visit.location.display;

            if (this.appConfigService.abha_section) {
              // check if abha number / abha address exists for this patient
              this.getAbhaDetails(patient)
            }
            // check if visit note exists for this visit
            this.visitNotePresent = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_NOTE);
            // check if visit complete exists for this visit
            this.visitCompleted = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
            // check if Patient Exit Survey exists for this visit
            this.visitEnded = this.visitSummaryService.checkIfEncounterExists(visit.encounters, visitTypes.PATIENT_EXIT_SURVEY) || visit.stopDatetime;
            this.getPastVisitHistory();
            if (this.visitNotePresent) {
              this.visitNotePresent.encounterProviders.forEach((p: EncounterProviderModel) => {
                if (p.provider.uuid === this.provider.uuid) {
                  this.isVisitNoteProvider = true;
                }
              });
              this.checkIfPatientInteractionPresent(visit.attributes);
              this.checkIfDiagnosisPresent();
              this.checkIfMedicationPresent();
              this.getAdvicesList();
              this.checkIfAdvicePresent();
              this.getTestsList();
              this.checkIfTestPresent();
              this.checkIfReferralPresent();
              this.checkIfFollowUpPresent();
              this.checkIfPatientCallDurationPresent(visit.attributes)
              this.checkIfCallStatusPresent(visit.attributes)
              this.checkIfDiscussionSummaryPresent();
              this.checkIfRecommendationPresent();
              if(isFeaturePresent('medicationFrequencyList')) this.getFrequencyList();
            }
            if (this.patientVisitSummary.notes_section) {
              this.getAdditionalNote(visit.attributes);
            }
            this.getAppointment(visit.uuid);
            this.getVisitProvider(visit.encounters);
            this.getVitalObs(visit.encounters);
            this.getCheckUpReason(visit.encounters);
            this.getPhysicalExamination(visit.encounters);
            this.getEyeImages(visit);
            this.getMedicalHistory(visit.encounters);
            if (this.patientVisitSummary.attachment_section) {
              this.getVisitAdditionalDocs(visit);
            }
            // Load event log from visit attributes
            const eventLogAttr = visit.attributes.find(attr => attr.attributeType.uuid === '98660a74-9f8b-41d5-b142-ed3f22684068');
            if (eventLogAttr) {
              this.eventLog = keepOnlyPairedEvents(JSON.parse(eventLogAttr.value || '[]'));
              this.eventLogAttributeUuid = eventLogAttr.uuid;
            }
            if (environment.brandName === 'KCDO' && this.visit && this.visit.uuid && !this.visitNotePresent) {
              this.logUserEvent('visit-summary open');
            }
          }
          this.checkOpenChatBoxFlag();
        });
      }
    }, (error) => {
      this.router.navigate(['/dashboard']);
    });
  }

  /**
  * Get visit provider details
  * @param {EncounterModel[]} encounters - Array of visit encounters
  * @return {void}
  */
  getVisitProvider(encounters: EncounterModel[]): void {
    encounters.forEach((encounter: EncounterModel) => {
      if (encounter.display.match(visitTypes.ADULTINITIAL) !== null) {
        this.providerName = encounter.encounterProviders[0].provider.person.display;
        // store visit provider in local-Storage
        setCacheData(visitTypes.PATIENT_VISIT_PROVIDER, JSON.stringify(encounter.encounterProviders[0]));
        encounter.encounterProviders[0].provider.attributes.forEach(
          (attribute) => {
            if (attribute.display.match(doctorDetails.PHONE_NUMBER) != null) {
              this.hwPhoneNo = attribute.value;
            }
          }
        );
      }
    });
  }

  /**
  * Get appointment for the given visit
  * @param {string} visitId - Visit uuid
  * @return {void}
  */
  getAppointment(visitId: string): void {
    this.appointmentService.getAppointment(visitId).subscribe((res: ApiResponseModel) => {
      if (res) {
        this.visitAppointment = res?.data?.slotJsDate;
      }
    });
  }

  /**
  * Get patient identifier for given identifier type
  * @param {string} identifierType - Identifier type
  * @return {void}
  */
  getPatientIdentifier(identifierType: string): string {
    let identifier: string = '';
    if (this.patient) {
      this.patient.identifiers.forEach((idf: PatientIdentifierModel) => {
        if (idf.identifierType.display === identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  /**
  * Get vital observations from the vital encounter
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getVitalObs(encounters: EncounterModel[]): void {
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.VITALS) {
        this.vitalObs = enc.obs;
      }
    });
  }

  /**
  * Get vital value for a given vital uuid
  * @param {string} uuid - Vital uuid
  * @return {any} - Obs value
  */
  getObsValue(uuid: string, key?: string): any {
    const v = this.vitalObs.find(e => e.concept.uuid === uuid);
    const value = v?.value ? ( typeof v.value == 'object') ? v.value?.display : v.value : null;
    if(!value && key === 'bmi') {
      return calculateBMI(this.vitals, this.vitalObs);
    }
    return value
  }

  /**
  * Get chief complaints and patient visit reason/summary
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getCheckUpReason(encounters: EncounterModel[]): void {
    this.cheifComplaints = [];
    this.checkUpReasonData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
          if (obs.concept.display === visitTypes.CURRENT_COMPLAINT) {
            this.currentComplaint = obs.value;
            const currentComplaint = this.visitService.getData(obs)?.value.split('<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i] && currentComplaint[i].length > 1) {
                const obs1 = currentComplaint[i].split('<');
                if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  this.cheifComplaints.push(obs1[0]);
                }
                const splitByBr = currentComplaint[i].split('<br/>');
                if (splitByBr[0].includes(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  const obj1: PatientHistoryModel = {};
                  obj1.title = this.translateService.instant(visitTypes.ASSOCIATED_SYMPTOMS);
                  obj1.data = [];
                  for (let j = 1; j < splitByBr.length; j = j + 2) {
                    if (splitByBr[j].trim() && splitByBr[j].trim().length > 1) {
                      obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1].trim() });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                } else {
                  const obj1: PatientHistoryModel = {};
                  obj1.title = splitByBr[0].replace('</b>:', '');
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim() && splitByBr[k].trim().length > 1) {
                      const splitByDash = splitByBr[k].split('-');
                      const processedStrings = splitByDash.slice(1, splitByDash.length).join('-').split(".").map(itemList => {
                        let splitByHyphen = itemList.split(" - ");
                        let value = splitByHyphen.pop() || "";
                        // if(this.isValidUnitFormat(value)){
                        //   if (this.checkTestUnitValues(diagnostics?.testUnits, value, splitByHyphen)) {
                        //     value = `<span class="light-green">${value}</span>`;
                        //   } else {
                        //     value = `<span class="red-color">${value}</span>`;
                        //   }
                        // } else {
                        //   if(this.checkTestNameValues(diagnostics?.testNames, value)) {
                        //     value = `<span class="light-green">${value}</span>`;
                        //   }
                        // }
                        splitByHyphen.push(value);
                        return splitByHyphen.join(" - ");
                      });
                      const resultString = processedStrings.join(". ").trim();
                      obj1.data.push({ key: splitByDash[0].replace('• ', ''), value: resultString });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                }
              }
            }
          }
        });
      }
    });
  }

  /**
  * Validates the format of a unit string.
  * @param {string} unit - The unit string.
  * @return {boolean} - True if valid, false otherwise.
  */
  isValidUnitFormat(unit: string): boolean {
    const unitRegex = /(?:^|\s)\d+(\.\d+)?\s*(g\/dL|%|million\/µL|mg\/dL|U\/L|seconds?|cells\/µL|\/µL|fL|pg\/cell|mL\/min\/1.73\s*m²|mEq\/L|ng\/mL)(?:\s|$)/i;
    return unitRegex.test(unit);
  }

  /**
  * Checks if the value and unit are valid for a diagnostic unit.
  * @param {DiagnosticUnit[]} diagnosticsUnit - List of diagnostic units.
  * @param {string} value - The value and unit to check.
  * @param {string[]} valueArray - Additional values (last item is the test name).
  * @return {boolean} - True if valid, false otherwise.
  */
  checkTestUnitValues(diagnosticsUnit: DiagnosticUnit[], value: string, valueArray: string[]): boolean {
    const popValue = valueArray.slice(-1)[0];
    let [unitCount, unitType] = value.split(" ");

    for (let unit = 0; unit < diagnosticsUnit.length; unit++) {
      if (diagnosticsUnit[unit]?.name?.toLowerCase() === popValue?.toLowerCase()){
        if (value.includes(diagnosticsUnit[unit]?.unit?.toLowerCase()) && (diagnosticsUnit[unit]?.unit?.length === unitType?.length)){
          if (Number(unitCount) >= diagnosticsUnit[unit].min && Number(unitCount) <= diagnosticsUnit[unit].max){
            return true;
          } else {
            return false;
          }
        }
      }
    }
    return false;
  }

  /**
  * Checks if a test name exists in the list of diagnostic names.
  * @param {DiagnosticName[]} diagnosticsName - List of diagnostic names.
  * @param {string} value - The test name to check.
  * @return {boolean} - True if found, false otherwise.
  */
  checkTestNameValues(diagnosticsName: DiagnosticName[], value: string): boolean {
    for (let name = 0; name < diagnosticsName.length; name++) {
      if (diagnosticsName[name]?.testName?.toLowerCase() === value?.toLowerCase()){
        return true;
      }
    }
    return false;
  }

  /**
  * Get physical examination details
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getPhysicalExamination(encounters: EncounterModel[]): void {
    this.physicalExaminationData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
          if (obs.concept.display === 'PHYSICAL EXAMINATION') {
            const physicalExam = this.visitService.getData(obs)?.value.replace(new RegExp('<br/>►', 'g'), '').split('<b>');
            for (let i = 0; i < physicalExam.length; i++) {
              if (physicalExam[i]) {
                const splitByBr = physicalExam[i].split('<br/>');
                if (splitByBr[0].includes('Abdomen')) {
                  const obj1: PatientHistoryModel = {};
                  obj1.title = splitByBr[0].replace('</b>', '').replace(':', '').trim();
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim()) {
                      obj1.data.push({ key: splitByBr[k].replace('• ', ''), value: null });
                    }
                  }
                  this.physicalExaminationData.push(obj1);
                } else {
                  const obj1: PatientHistoryModel = {};
                  obj1.title = splitByBr[0].replace('</b>', '').replace(':', '').trim();
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim()) {
                      const splitByDash = splitByBr[k].split('-');
                      obj1.data.push({ key: splitByDash[0].replace('• ', ''), value: splitByDash.slice(1, splitByDash.length).join('-') });
                    }
                  }
                  this.physicalExaminationData.push(obj1);
                }
              }
            }
          }
        });
      }
    });
  }

  /**
  * Get medical history details
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getMedicalHistory(encounters: EncounterModel[]): void {
    this.patientHistoryData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display === visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
          if (obs.concept.display === visitTypes.MEDICAL_HISTORY) {
            const medicalHistory = this.visitService.getData(obs)?.value.split('<br/>');
            const obj1: PatientHistoryModel = {};
            obj1.title = this.translateService.instant('Patient history');
            obj1.data = [];
            for (let i = 0; i < medicalHistory.length; i++) {
              if (medicalHistory[i]) {
                const splitByDash = medicalHistory[i].split('-');
                obj1.data.push({ key: splitByDash[0].replace('• ', '').trim(), value: splitByDash.slice(1, splitByDash.length).join('-').trim() });
              }
            }
            this.patientHistoryData.push(obj1);
          }
          if (obs.concept.display === visitTypes.FAMILY_HISTORY) {
            const familyHistory = this.visitService.getData(obs)?.value.split('<br/>');
            const obj1: PatientHistoryModel = {};
            obj1.title = this.translateService.instant('Family history');
            obj1.data = [];
            for (let i = 0; i < familyHistory.length; i++) {
              if (familyHistory[i]) {
                if (familyHistory[i].includes(':')) {
                  const splitByColon = familyHistory[i].split(':');
                  const splitByDot = splitByColon[1].trim().split("•");
                  splitByDot.forEach((element: string) => {
                    if (element.trim()) {
                      const splitByComma = element.split(',');
                      obj1.data.push({ key: splitByComma.shift().trim(), value: splitByComma.length ? splitByComma.toString().trim() : " " });
                    }
                  });
                } else {
                  obj1.data.push({ key: familyHistory[i].replace('•', '').trim(), value: null });
                }
              }
            }
            this.patientHistoryData.push(obj1);
          }
        });
      }
    });
  }

  /**
  * Get eye images
  * @param {VisitModel} visit - Visit
  * @return {void}
  */
  getEyeImages(visit: VisitModel): void {
    this.eyeImages = [];
    this.diagnosisService.getObs(visit.patient.uuid, conceptIds.conceptPhysicalExamination).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value`, section: obs.comment };
          this.eyeImages.push(data);
        }
      });
    });
  }

  /**
  * Open eye images preview modal
  * @param {number} index - Index
  * @param {string} section - Section title
  * @return {void}
  */
  previewEyeImages(index: number, section: string): void {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.getImagesBySection(section) }).subscribe((res) => { });
  }

  /**
  * Get additional docs
  * @param {VisitModel} visit - Visit
  * @return {void}
  */
  getVisitAdditionalDocs(visit: VisitModel): void {
    this.additionalDocs = [];
    this.diagnosisService.getObs(visit.patient.uuid, conceptIds.conceptAdditionlDocument).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value`, section: obs.comment };
          this.additionalDocs.push(data);
        }
      });
    });
  }

  /**
  * Open doc images preview modal
  * @param {number} index - Index
  * @return {void}
  */
  previewDocImages(index: number): void {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.additionalDocs }).subscribe((res) => { });
  }

  /**
  * Callback for tab changed event
  * @param {number} event - Array of encounters
  * @return {void}
  */
  onTabChange(event: number): void {
    this.selectedTabIndex = event;
  }

  /**
  * Get age of patient from birthdate
  * @param {string} birthdate - Birthdate
  * @return {string} - Age
  */
  getAge(birthdate: string): string {
    const years = moment().diff(birthdate, 'years');
    const months = moment().diff(birthdate, 'months');
    const days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} ${this.translateService.instant('years')}`;
    } else if (months > 1) {
      return `${months} ${this.translateService.instant('months')}`;
    } else {
      return `${days} ${this.translateService.instant('days')}`;
    }
  }

  /**
  * Get person attribute value for a given attribute type
  * @param {str'} attrType - Person attribute type
  * @return {any} - Value for a given attribute type
  */
  getPersonAttributeValue(attrType: string): any {
    let val = 'NA';
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: PersonAttributeModel) => {
        if (attrType === attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  /**
  * Get whatsapp link
  * @return {string} - Whatsapp link
  */
  getWhatsAppLink(): string {
    return this.visitService.getWhatsappLink(this.getPhoneNumber(), `Hello I'm calling for consultation`);
  }

  /**
  * Replcae the string charaters with *
  * @param {string} str - Original string
  * @return {string} - Modified string
  */
  replaceWithStar(str: string): string {
    const n = str.length;
    return str.replace(str.substring(0, n - 4), '*****');
  }

  /**
  * Check visit status
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  checkVisitStatus(encounters: EncounterModel[]): void {
    if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) {
      this.visitStatus = visitTypes.ENDED_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE)) {
      this.visitStatus = visitTypes.COMPLETED_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) {
      this.visitStatus = visitTypes.IN_PROGRESS_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) {
      this.visit['uploadTime'] = this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.FLAGGED) ? this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.FLAGGED)['encounterDatetime'] : null;
      this.visitStatus = visitTypes.PRIORITY_VISIT;
    } else if (this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) || this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.VITALS)) {
      this.visit['uploadTime'] = this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) ? this.visitSummaryService.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL)['encounterDatetime'] : null;
      this.visitStatus = visitTypes.AWAITING_VISIT;
    }
  }

  /**
  * Refer to specialist
  * @return {void}
  */
  referSpecialist(): void {
    if (this.referSpecialityForm.invalid) {
      this.toastr.warning(this.translateService.instant('Please select specialization'), this.translateService.instant('Invalid!'));
      return;
    }
    if (this.visitNotePresent) {
      this.toastr.warning(this.translateService.instant('Can\'t refer, visit note already exists for this visit!'), this.translateService.instant('Can\'t refer'));
      return;
    }
    this.coreService.openConfirmationDialog({ confirmationMsg: 'Are you sure to re-assign this visit to another doctor?', cancelBtnText: 'Cancel', confirmBtnText: 'Confirm' })
      .afterClosed().subscribe((res: boolean) => {
        if (res) {
          const attr = this.visitSummaryService.checkIfAttributeExists(this.visit.attributes);
          if (attr) {
            this.visitService.updateAttribute(this.visit.uuid, attr.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.specialization }).subscribe((result: VisitAttributeModel) => {
              if (result) {
                this.updateEncounterForRefer();
              }
            });
          } else {
            this.visitService.postAttribute(this.visit.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.specialization }).subscribe((result: VisitAttributeModel) => {
              if (result) {
                this.updateEncounterForRefer();
              }
            });
          }
        }
      });
  }

  /**
  * Refer visit to another speciality
  * @return {void}
  */
  updateEncounterForRefer(): void {
    const timestamp = new Date(Date.now() - 30000);
    const patientUuid = this.visit.patient.uuid;
    const providerUuid = this.provider.uuid;
    const json = {
      patient: patientUuid,
      encounterType: '8d5b27bc-c2cc-11de-8d13-0010c6dffd0f', // ADULTINITIAL encounter
      encounterProviders: [
        {
          provider: providerUuid,
          encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e04', // Doctor encounter role
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: timestamp,
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.router.navigate(['/dashboard']);
        this.toastr.success(this.translateService.instant('Visit has been re-assigned to the another speciality doctor successfully.'), this.translateService.instant('Visit Re-assigned!'));
      }
    });
  }

  /**
  * Start chat with HW/patient
  * @return {void}
  */
  startChat(): void {
    if (this.dialogRef1) {
      this.dialogRef1.close();
      this.isCalling = false;
      return;
    }
    this.isCalling = true;
    this.dialogRef1 = this.coreService.openChatBoxModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID')
    });

    this.dialogRef1.afterClosed().subscribe((res) => {
      this.dialogRef1 = undefined;
      this.isCalling = false;
    });
  }

  /**
  * Start video call with HW/patient
  * @return {void}
  */
  startCall(): void {
    if (this.dialogRef2) {
      this.dialogRef2.close();
      this.isCalling = false;
      return;
    }
    this.isCalling = true;
    this.dialogRef2 = this.coreService.openVideoCallModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      connectToDrId: this.visitSummaryService.userId,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID'),
      initiator: 'dr',
      drPersonUuid: this.provider?.person.uuid,
      patientAge: this.patient.person.age,
      patientGender: this.patient.person.gender
    });

    this.dialogRef2.afterClosed().subscribe((res) => {
      this.dialogRef2 = undefined;
      this.isCalling = false;
    });
  }

  /**
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
  checkIfDateOldThanOneDay(data: string): string {
    const hours = moment().diff(moment(data), 'hours');
    const minutes = moment().diff(moment(data), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    }
    if (hours < 1) {
      if (minutes < 0) { return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`; }
      return `${minutes} minutes ago`;
    }
    return `${hours} hrs ago`;
  }

  /**
  * Start visit note
  * @return {void}
  */
  startVisitNote(): void {
    const json = {
      patient: this.visit.patient.uuid,
      encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79', // Visit Note encounter
      encounterProviders: [
        {
          provider: this.provider.uuid,
          encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03', // Doctor encounter role
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: new Date(Date.now() - 30000),
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      this.visitNotePresent = response;
      // save diagnosis from case summary
      if(environment.brandName == "KCDO" && this.checkUpReasonData.length >= 1){
        let diagnosisData = this.checkUpReasonData[0].data?.find(obj=>obj.key.includes("Diagnosis"));
        if(diagnosisData){
          this.diagnosisSecondaryForm.patchValue({diagnosis:diagnosisData.value})
          this.saveDiagnosisSecondary().subscribe(res=>{
              this.getVisit(this.visit.uuid);
          });
        } else {
          this.getVisit(this.visit.uuid);
        }
      } else {
        this.getVisit(this.visit.uuid);
      }
    });
  }

  /**
  * Check if patient interaction visit attrubute present or not
  * @param {VisitAttributeModel[]} attributes - Array of visit attributes
  * @returns {void}
  */
  checkIfPatientInteractionPresent(attributes: VisitAttributeModel[]): void {
    attributes.forEach((attr: VisitAttributeModel) => {
      if (attr.attributeType.display === visitTypes.PATIENT_INTERACTION) {
        this._patientInteraction = attr.value
        this.patientInteractionUuid = attr.uuid
      }
      if (attr.attributeType.display === visitTypes.HW_INTERACTION) {
        this._hwInteraction = attr.value
        this.hwInteractionUuid = attr.uuid
      }
      if (attr.attributeType.display === visitTypes.PATIENT_INTERACTION_COMMENT) {
        this.patientInteractionCommentForm.patchValue(attr)
      }
    });
  }

  /**
  * Get additional notes from visit attributes
  * @param {VisitAttributeModel[]} attributes - Array of visit attributes
  * @returns {void}
  */
  getAdditionalNote(attributes: VisitAttributeModel[]): void {
    attributes.forEach((attr: VisitAttributeModel) => {
      if (attr.attributeType.display === 'AdditionalNote') {
        this.additionalNotes = attr.value;
      }
    });
  }

  /**
  * Save HW interaction visit attribute
  * @param {String} val - Array of visit attributes
  * @returns {void}
  */
  saveHWInteraction(): Observable<any> {
    if(this.hwInteraction == undefined) return of(false)
    const payload = {
      attributeType: visitAttributeTypes.HWInteraction,
      value: this.hwInteraction
    };
    if(this.hwInteractionUuid) 
      return this.visitService.updateAttribute(this.visit.uuid,this.hwInteractionUuid, payload);
    else
      return this.visitService.postAttribute(this.visit.uuid, payload).pipe(tap((res:VisitAttributeModel)=>this.hwInteractionUuid=res.uuid));
  };

  /**
  * Save patient interaction visit attribute
  * @returns {void}
  */
  savePatientInteraction(): Observable<any> {
    if(this.patientInteraction == undefined) return of(false)
    const payload = {
      attributeType: visitAttributeTypes.PatientInteraction,
      value: this.patientInteraction
    };
    if(this.patientInteractionUuid) 
      return this.visitService.updateAttribute(this.visit.uuid,this.patientInteractionUuid, payload);
    else
      return this.visitService.postAttribute(this.visit.uuid, payload).pipe(tap((res:VisitAttributeModel)=>this.patientInteractionUuid=res.uuid));
  };

  /**
  * Save HW interaction visit attribute
  * @param {String} val - Array of visit attributes
  * @returns {void}
  */
  savePatientInteractionComment(): Observable<any> {
    if(this.patientInteractionCommentForm.invalid && this.isSubSectionEnabled("Patient Interaction",'Comment') || !this.patientInteractionCommentForm.value.value) return of(false)
    const payload = {
      attributeType: visitAttributeTypes.patientInteractionComment,
      value: this.patientInteractionCommentForm.value.value
    };
    if(this.patientInteractionCommentForm.value.uuid) 
      return this.visitService.updateAttribute(this.visit.uuid,this.patientInteractionCommentForm.value.uuid, payload);
    else
      return this.visitService.postAttribute(this.visit.uuid, payload).pipe(tap((res:VisitAttributeModel)=>this.patientInteractionCommentForm.patchValue({uuid:res.uuid})));
  };

  /**
  * Save patient interaction visit attribute
  * @returns {void}
  */
  saveCallStatus(): Observable<any> {
    if(this.patientCallStatusForm.valid){
      const payload = {
        attributeType: visitAttributeTypes.callStatus,
        value: `${obsStringify({...this.patientCallStatusForm.value})}`,
      };
      if(this.patientCallStatusForm.value.uuid) 
        return this.visitService.updateAttribute(this.visit.uuid,this.patientCallStatusForm.value.uuid, payload);
      else
        return this.visitService.postAttribute(this.visit.uuid, payload).pipe(tap((res:VisitAttributeModel)=>this.patientCallStatusForm.patchValue({uuid:res.uuid})));
    } else {
      return of(false)
    }
  };

  /**
  * Toggle diagnosis add form, show/hide add more diagnosis button
  * @returns {void}
  */
  toggleDiagnosis(): void {
    this.addMoreDiagnosis = !this.addMoreDiagnosis;
    this.diagnosisForm.reset();
  }

  /**
  * Get diagnosis for the visit
  * @returns {void}
  */
  checkIfDiagnosisPresent(): void {
    this.existingDiagnosis = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptDiagnosis).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if(obs.value.includes("}") && this.isFeatureAvailable('dp_diagnosis_secondary')){
            this.diagnosisSecondaryForm.patchValue(obsParse(obs.value,obs.uuid))
          } else {
            if(obs.value.includes("}")){
              let obsData:any = obsParse(obs.value,obs.uuid)
              this.existingDiagnosis.push({
                diagnosisName: obsData.diagnosis,
                diagnosisStatus: obsData.type,
                uuid: obsData.uuid,
              });
            } else {
              if(this.isFeatureAvailable('dp_diagnosis_secondary'))
                this.diagnosisService.deleteObs(obs.uuid).subscribe()
              else{
                let obsValues = obs.value.split(':');
                if(obs.value.includes("::")){
                  obsValues = obs.value.split("::").pop()?.split(":");
                }
                const obsValuesOne = obsValues?.[1]?.split('&');
                this.existingDiagnosis.push({
                  diagnosisName: obsValues?.[0]?.trim() ?? '',
                  diagnosisType: obsValuesOne?.[0]?.trim() ?? '',
                  diagnosisStatus: obsValuesOne?.[1]?.trim() ?? '',
                  uuid: obs.uuid,
                });
              }
            }
          }
        }
      });
    });
  }

  /**
  * Callback for key up event diagnosis input
  * @returns {void}
  */
  onKeyUp(event: { term: string; }): void {
    this.diagnosisForm.controls.diagnosisName.reset();
    this.diagnosisValidated = false;
    this.dSearchSubject.next(event.term);
  }

  /**
   * Search diagnosis for a given value
   * @param {string} val - search value
   * @returns {void}
   */
  searchDiagnosis(val: string): void {
    if (!val || val.length < 3) {
      return;
    }

    // Helper to process OpenMRS diagnosis response
    const processOpenMrsDiagnosis = (response: any) => {
      if (response.results && response.results.length) {
        const data = response.results
          .filter((element: any) => element && element.conceptClass && element.conceptClass.uuid === conceptIds.conceptDiagnosisClass)
          .map((element: any) => ({
            name: element?.name?.display,
            snomedId: element?.mappings?.[0],
          }));
        this.diagnosisSubject.next(data);
      } else if (isFeaturePresent("snomedCtDiagnosis")) {
        // If no results and SNOMED is enabled, fallback to SNOMED search
        this.diagnosisService.getSnomedDiagnosisList(val).subscribe({
          next: processSnomedDiagnosis,
          error: () => this.diagnosisSubject.next([])
        });
      } else {
        this.diagnosisSubject.next([]);
      }
    };

    // Helper to process SNOMED diagnosis response
    const processSnomedDiagnosis = (res: any) => {
      if (res && res.result) {
        const data = res.result.map((element: { term: string, conceptId: string }) => ({
          name: element.term,
          conceptId: element.conceptId
        }));
        this.diagnosisSubject.next(data);
      } else {
        this.diagnosisSubject.next([]);
      }
    };

    // Main OpenMRS diagnosis search
    this.diagnosisService.getDiagnosisList(val, isFeaturePresent("snomedCtDiagnosis") ? 'SNOMED' : 'ICD10').subscribe({
      next: processOpenMrsDiagnosis,
      error: () => this.diagnosisSubject.next([])
    });
  }

  /**
  * Save disgnosis for a given value
  * @returns {void}
  */
  saveDiagnosis(): void {
    if (this.diagnosisForm.invalid) {
      return; 
    }
    if (this.existingDiagnosis.find(o => o.diagnosisName.toLocaleLowerCase() === this.diagnosisForm.value.diagnosisName.toLocaleLowerCase())) {
      this.toastr.warning(this.translateService.instant('Diagnosis Already Exist'), this.translateService.instant('Duplicate Diagnosis'));
      return;
    }

    // Update updatedObsData and enable save as draft button
    // this.updatedObsData.diagnosis = true;
    // this.checkChanges(this.updatedObsData);

    const diagnosisName = this.diagnosisForm.value.diagnosisName?.replace(/:/g, ' ');
    this.existingDiagnosis.push({...this.diagnosisForm.value, diagnosisName: diagnosisName });
    this.diagnosisForm.reset();

    // this.encounterService.postObs({
    //   concept: conceptIds.conceptDiagnosis,
    //   person: this.visit.patient.uuid,
    //   obsDatetime: new Date(),
    //   value: `${this.diagnosisCode?.value ? this.diagnosisCode?.value : 'NA'}::${diagnosisName}:${this.diagnosisForm.value.diagnosisType} & ${this.diagnosisForm.value.diagnosisStatus}`,
    //   encounter: this.visitNotePresent.uuid
    // }).subscribe((res: ObsModel) => {
    //   if (res) {
        
    //   }
    // });

    // if (this.diagnosisForm?.value?.isSnomed && isFeaturePresent("snomedCtDiagnosis")) {
    //   this.diagnosisService.addSnomedDiagnosis(this.diagnosisForm.value.diagnosisName, this.diagnosisForm.value.diagnosisCode)
    //     .subscribe({
    //       next: (res) => {
    //         if (res) {
    //           this.diagnosisForm.reset();
    //         }
    //       }
    //   });
    // }
  }

  get diagnosisCode(): AbstractControl | null {
    return this.diagnosisForm.get('diagnosisCode');
  }

  onDiagnosisChange(event: any): void {
    this.diagnosisValidated = true;
    if (isFeaturePresent("snomedCtDiagnosis")) {
      if (event.conceptId) {
        this.diagnosisForm.addControl('diagnosisCode', new FormControl(null));
        this.diagnosisForm.addControl('isSnomed', new FormControl(null));
        this.diagnosisForm.patchValue({ diagnosisCode: event.conceptId });
        this.diagnosisForm.patchValue({ isSnomed: true });
      }
      else if (event.snomedId) {
        this.diagnosisForm.addControl('diagnosisCode', new FormControl(null));
        this.diagnosisForm.patchValue({ diagnosisCode: event.snomedId?.display.split(': ')[1] });
      }
    }
  }

  /**
  * Delete disgnosis for a given index and uuid
  * @param {number} index - Index
  * @param {string} uuid - Diagnosis obs uuid
  * @returns {void}
  */
  deleteDiagnosis(index: number, uuid: string): void {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.existingDiagnosis.splice(index, 1);
    });
  }

  /**
  * Toggle medicine add form, show/hide add more medicine button
  * @returns {void}
  */
  toggleMedicine(): void {
    this.addMoreMedicine = !this.addMoreMedicine;
    this.addMedicineForm.reset();
  }

  /**
  * Get medicines for the visit
  * @returns {void}
  */
  checkIfMedicationPresent(): void {
    this.medicines = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptMed).subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.medicines.push({
            drug: obs.value?.split(':')[0],
            strength: obs.value?.split(':')[1],
            days: obs.value?.split(':')[2],
            timing: obs.value?.split(':')[3],
            remark: obs.value?.split(':')[4],
            frequency: obs.value?.split(':')[5] ? obs.value?.split(':')[5] : "",
            uuid: obs.uuid
          });
        }
      });
    });
  }

  /**
  * Save medicine
  * @returns {void}
  */
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

  /**
  * Save additional instruction
  * @returns {void}
  */
  saveAdditionalInstruction(): Observable<any> {
    if(this.additionalInstructionForm.value.uuid){
      if(this.additionalInstructionForm.valid)
        return this.encounterService.updateObs(this.additionalInstructionForm.value.uuid,{
          value: this.additionalInstructionForm.value.value
        })
      else 
        return this.diagnosisService.deleteObs(this.additionalInstructionForm.value.uuid).pipe(tap((response: ObsModel) => this.additionalInstructionForm.patchValue({uuid: null})))
    } else if(this.additionalInstructionForm.valid) {
      return this.encounterService.postObs({
        concept: conceptIds.conceptMed,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: this.additionalInstructionForm.value.value,
        encounter: this.visitNotePresent.uuid
      }).pipe(tap((response: ObsModel) => this.additionalInstructionForm.patchValue({uuid: response.uuid})));
    } else {
      return of(false)
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

    /**
    * Get frequency list
    * @returns {void}
    */
    getFrequencyList(): void {
      this.diagnosisService.concept(conceptIds.conceptFrequencyList).subscribe(res => {
        const result = res.answers;
        this.frequencyList = [];
        result.forEach((ans: { display: string; }) => {
          this.frequencyList.push(ans.display);
        });
      });
    }

  /**
  * Toggle advice add form, show/hide add more advice button
  * @returns {void}
  */
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
    this.advices.push({value: this.addAdviceForm.value.advice });
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
              this.tests.push(obs);
          }
        });
      });
  }

  /**
  * Get tests for the visit
  * @returns {void}
  */
  checkIfDiscussionSummaryPresent(): void {
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptDiscussionSummary)
      .subscribe((response: ObsApiResponseModel) => {
        response.results.forEach((obs: ObsModel) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.discussionSummaryForm.patchValue({uuid:obs.uuid, value:obs.value})
          }
        });
      });
  }

  /**
  * Add test
  * @returns {void}
  */
  addTest() {
    if (this.addTestForm.invalid) {
      return;
    }
    if (this.tests.find((o: TestModel) => o.value === this.addTestForm.value.test)) {
      this.toastr.warning(this.translateService.instant('Test already added, please add another test.'), this.translateService.instant('Already Added'));
      return;
    }
    this.tests.push({value: this.addTestForm.value.test });
    this.addTestForm.reset();
  }


  /**
  * Save test
  * @returns {Observable<any>}
  */
  saveTest(): Observable<any> {
    if(this.testForm.value.uuid){
      if(this.testForm.valid && this.obsData.test !== this.testForm.value.test)
        return this.encounterService.updateObs(this.testForm.value.uuid,{
          value: this.testForm.value.test,
        })
      else 
        return this.diagnosisService.deleteObs(this.testForm.value.uuid).pipe(tap((response: ObsModel) => this.testForm.patchValue({ uuid: null})));
    } else if(this.testForm.valid) {
      return this.encounterService.postObs({
        concept: conceptIds.conceptTest,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: this.testForm.value.test,
        encounter: this.visitNotePresent.uuid,
      }).pipe(tap((response: ObsModel) => this.testForm.patchValue({ uuid: response.uuid})));
    } else {
      return of(false)
    }
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
    });
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
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid && obs_values.length > 1 ) {
            this.referrals.push({ uuid: obs.uuid, speciality: obs_values[0].trim(), facility: obs_values[1].trim(), priority: obs_values[2].trim(), reason: obs_values[3].trim() ? obs_values[3].trim() : '-' });
          }
        });
      });
  }


  /**
  * Get Recommendation for the visit
  * @returns {void}
  */
  checkIfRecommendationPresent(): void {
    this.diagnosisService.getObs(this.visit.patient.uuid, conceptIds.conceptRecommendation)
    .subscribe((response: ObsApiResponseModel) => {
      response.results.forEach((obs: ObsModel) => {
        if(obs.encounter && obs.encounter.visit.uuid === this.visit.uuid){
          this.recommendationForm.patchValue({uuid: obs.uuid, value: obs.value})
        }
      });
    });
  }

  /**
  * Save referral
  * @returns {void}
  */
  addReferral(): void {
    if (this.addReferralForm.invalid) {
      return;
    }
    if (this.referrals.find((o: ReferralModel) => o.speciality === this.addReferralForm.value.speciality)) {
      this.toastr.warning(this.translateService.instant('Referral already added, please add another referral.'), this.translateService.instant('Already Added'));
      return;
    }

    // Update updatedObsData and enable save as draft button
    // this.updatedObsData.addReferral = true;
    // this.checkChanges(this.updatedObsData);

    const refer_reason = this.addReferralForm.value.reason ? this.addReferralForm.value.reason : '';
    this.referrals.push({speciality: this.addReferralForm.value.speciality, facility: this.addReferralForm.value.facility, priority: this.addReferralForm.value.priority_refer, reason: refer_reason });
    this.addReferralForm.reset();
    this.addReferralForm.controls.priority_refer.setValue('Elective');
    // this.encounterService.postObs({
    //   concept: conceptIds.conceptReferral,
    //   person: this.visit.patient.uuid,
    //   obsDatetime: new Date(),
    //   value: `${this.addReferralForm.value.speciality}:${this.addReferralForm.value.facility}:${this.addReferralForm.value.priority_refer}:${refer_reason}`,
    //   encounter: this.visitNotePresent.uuid,
    // }).subscribe((response: ObsModel) => {
      
    // });
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
    });
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
            const type = result.find((v: string) => v.includes('Type:'))?.split('Type:')?.[1]?.trim();
            followUpDate = moment(result[0]).format('YYYY-MM-DD');
            followUpTime = time ? time : null;
            followUpReason = remark ? remark : null;
            followUpType = type && type !== 'null' ? type : null;
            wantFollowUp = 'Yes';
          }
          this.followUpDatetime = obs.value;
          this.followUpForm.patchValue({
            present: true,
            wantFollowUp,
            followUpDate,
            followUpTime,
            followUpReason,
            uuid: obs.uuid,
            followUpType
          });
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
      const value = `${moment(this.followUpForm.value.followUpDate ?? new Date()).format('YYYY-MM-DD')},Time:${this.followUpForm.value.followUpTime ?? 'NA'},Remark:${this.followUpForm.value.followUpReason || 'NA'},Type:${this.followUpForm.value.followUpType || 'NA'}`;
      
      if (this.followUpForm.value.uuid) {
      return this.encounterService.updateObs(this.followUpForm.value.uuid, { value }).pipe(tap((response: ObsModel) => this.followUpForm.patchValue({ present: true})));    
    } else {
        return this.encounterService.postObs({
          concept: conceptIds.conceptFollow,
          person: this.visit.patient.uuid,
          obsDatetime: new Date(),
          value,
          encounter: this.visitNotePresent.uuid
        }).pipe(tap((response: ObsModel) => this.followUpForm.patchValue({ present: true})));   
     }
    }
    return of(null); // Return an Observable if no action needed
  }

  /**
  * Delete followup
  * @returns {void}
  */
  deleteFollowUp(): void {
    this.diagnosisService.deleteObs(this.followUpForm.value.uuid).subscribe(() => {
      this.followUpForm.patchValue({ present: false, uuid: null, wantFollowUp: '', followUpDate: null, followUpTime: null, followUpReason: null, followUpType: null });
      this.followUpDatetime = null;
    });
  }

  /**
  * Share prescription
  * @returns {boolean}
  */
  sharePrescription(): boolean {
    if (this.isFeatureAvailable('dp_diagnosis_secondary') && this.diagnosisSecondaryForm.invalid){
      this.toastr.warning(this.translateService.instant('Enter Diagnosis'), this.translateService.instant('Diagnosis Required'));
      return false;
    } else if (!this.isFeatureAvailable('dp_diagnosis_secondary') && this.existingDiagnosis.length === 0 ) {
      this.toastr.warning(this.translateService.instant('Diagnosis not added'), this.translateService.instant('Diagnosis Required'));
      return false;
    }
    if (this.isFeatureAvailable('visitFollowUp') && !this.followUpForm.value.present) {
      this.toastr.warning(this.translateService.instant('Follow-up not added'), this.translateService.instant('Follow-up Required'));
      return false;
    }
    this.changedFields = [];
    this.saveAllObs().subscribe({
      next: (responses) => {
        this.changesMade = false;
        //Open Share Prescription Confirmation Modal
        this.coreService.openSharePrescriptionConfirmModal().subscribe((res: boolean) => {
          if (res) {
            if (this.isVisitNoteProvider) {
              if (this.provider.attributes.length) {
                if (navigator.onLine) {
                  if (!this.visitCompleted) {
                    this.encounterService.postEncounter({
                      patient: this.visit.patient.uuid,
                      encounterType: 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e', // visit complete encounter type uuid
                      encounterProviders: [
                        {
                          provider: this.provider.uuid,
                          encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03', // Doctor encounter role
                        },
                      ],
                      visit: this.visit.uuid,
                      encounterDatetime: new Date(Date.now() - 30000),
                      obs: [
                        {
                          concept: '7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e', // Doctor details concept uuid
                          value: JSON.stringify(this.getDoctorDetails()),
                        },
                      ]
                    }).subscribe((post) => {
                      this.visitCompleted = true;
                      this.notifyHwForAvailablePrescription();
                      this.appointmentService.completeAppointment({ visitUuid: this.visit.uuid }).subscribe();
    
                      if (this.appConfigService.abha_section) {
                        this.updateAbhaDetails(post.uuid);
                      }
    
                      this.linkSvc.shortUrl(`/i/${this.visit.uuid}`).subscribe({
                        next: (linkSvcRes: ApiResponseModel) => {
                          const link = linkSvcRes.data.hash;
                          this.visitService.postAttribute(
                            this.visit.uuid,
                            {
                              attributeType: '1e02db7e-e117-4b16-9a1e-6e583c3994da', /** Visit Attribute Type for Prescription Link */
                              value: `/i/${link}`,
                            }).subscribe();
                          this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
                            if (result === 'view') {
                              // Open visit summary modal here....
                              this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                            } else if (result === 'dashboard') {
                              this.router.navigate(['/dashboard']);
                            }
                          });
                        },
                        error: (err) => {
                          this.toastr.error(err.message);
                          this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
                            if (result === 'view') {
                              // Open visit summary modal here....
                              this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                            } else if (result === 'dashboard') {
                              this.router.navigate(['/dashboard']);
                            }
                          });
                        }
                      });
                    });
                  } else {
                    this.coreService.openSharePrescriptionSuccessModal().subscribe((result: string | boolean) => {
                      if (result === 'view') {
                        // Open visit summary modal here....
                        this.coreService.openVisitPrescriptionModal({ uuid: this.visit.uuid });
                      } else if (result === 'dashboard') {
                        this.router.navigate(['/dashboard']);
                      }
                    });
                  }
                } else {
                  this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription due to poor network connection. Please try again or come back later', confirmBtnText: 'Try again' }).subscribe((c: boolean) => {
                    if (c) {
                      // Do nothing
                    }
                  });
                }
              } else {
                this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription since your profile is not complete.', confirmBtnText: 'Go to profile' }).subscribe((c: boolean) => {
                  if (c) {
                    this.router.navigate(['/dashboard/profile']);
                  }
                });
              }
            } else {
              this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription since this visit already in progress with another doctor.', confirmBtnText: 'Go to dashboard' }).subscribe((c: boolean) => {
                if (c) {
                  this.router.navigate(['/dashboard']);
                }
              });
            }
          }
        });
      },
      error: (error) => {
        console.error('Error saving observations', error);
      }
    });
    
  }

  /**
  * Get doctor details for the visit complete/encounter share prescription
  * @returns {any} - Doctor details completing the visit
  */
  getDoctorDetails(): any {
    const d: any = {};
    const attrs: string[] = [
      doctorDetails.QUALIFICATION,
      doctorDetails.FONT_OF_SIGN,
      doctorDetails.WHATS_APP,
      doctorDetails.REGISTRATION_NUMBER,
      doctorDetails.CONSULTATION_LANGUAGE,
      doctorDetails.TYPE_OF_PROFESSION,
      doctorDetails.ADDRESS,
      doctorDetails.WORK_EXPERIENCE,
      doctorDetails.RESEARCH_EXPERIENCE,
      doctorDetails.TEXT_OF_SIGN,
      doctorDetails.SPECIALIZATION,
      doctorDetails.PHONE_NUMBER,
      doctorDetails.COUNTRY_CODE,
      doctorDetails.EMAIL_ID,
      doctorDetails.WORK_EXPERIENCE_DETAILS,
      doctorDetails.SIGNATURE_TYPE,
      doctorDetails.SIGNATURE
    ];
    d.name = this.provider.person.display;
    d.uuid = this.provider.uuid;
    attrs.forEach((attr: string) => {
      this.provider.attributes.forEach((pattr: ProviderAttributeModel) => {
        if (pattr.attributeType.display === attr && !pattr.voided) {
          d[attr] = pattr.value;
        }
      });
    });
    return d;
  }

  /**
  * Get all past visits for the patient
  * @returns {void}
  */
  getPastVisitHistory(): void {
    this.pastVisits = [];
    this.visitService.recentVisits(this.visit.patient.uuid).subscribe((res: RecentVisitsApiResponseModel) => {
      const visits = res.results;
      if (visits.length > 1) {
        visits.forEach((visit: VisitModel) => {
          if (visit.uuid !== this.visit.uuid) {
            this.visitService.fetchVisitDetails(visit.uuid).subscribe((visitdetail: VisitModel) => {
              visitdetail.created_on = visitdetail.startDatetime;
              visitdetail.cheif_complaint = this.visitSummaryService.getCheifComplaint(visitdetail);
              visitdetail.encounters.forEach((encounter: EncounterModel) => {
                if (encounter.encounterType.display === visitTypes.VISIT_COMPLETE) {
                  visitdetail.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                  encounter.obs.forEach((o: ObsModel) => {
                    if (o.concept.display === 'Doctor details') {
                      visitdetail.doctor = JSON.parse(o.value);
                    }
                  });
                  encounter.encounterProviders.forEach((p: EncounterProviderModel) => {
                    visitdetail.doctor.gender = p.provider.person.gender;
                    visitdetail.doctor.person_uuid = p.provider.person.uuid;
                  });
                }
              });
              this.pastVisits.push(visitdetail);
              this.dataSource = new MatTableDataSource(this.pastVisits);
            });
          }
        });
      }
    });
  }

  /**
  * Open view visit summary modal
  * @returns {void}
  */
  openVisitSummaryModal(uuid: string): void {
    this.coreService.openVisitSummaryModal({ uuid });
  }

  /**
  * Open view visit prescription modal
  * @returns {void}
  */
  openVisitPrescriptionModal(uuid: string): void {
    this.coreService.openVisitPrescriptionModal({ uuid });
  }

  ngOnDestroy(): void {
    // Log back event
    if (environment.brandName === 'KCDO' && this.visit && this.visit.uuid && !this.visitNotePresent) {
      this.logUserEvent('back from visit summary');
    }
    deleteCacheData(visitTypes.PATIENT_VISIT_PROVIDER);
    if (this.dialogRef1) this.dialogRef1.close();
    if(this.callTimerInterval && !this.callTimerInterval.closed) this.callTimerInterval.unsubscribe();
    // Add unsubscribe from form tracking
    this.unsubscribeFromFormTracking();
  }

  /**
  * Getting Images by section
  * @param {string} section - Section Title
  * @returns {Array}
  */
  getImagesBySection(section: string): Array<DocImagesModel> {
    return this.eyeImages.filter(o => o.section?.toLowerCase() === section?.toLowerCase());
  }

  /**
  * Send notification to health worker for available prescription
  * @returns {void}
  */
  notifyHwForAvailablePrescription(title = null, type = null): void {
    const hwUuid = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.provider?.uuid;
    const openMRSID = this.getPatientIdentifier("OpenMRS ID");
    const payload = {
      title: title || `Prescription available for ${this.visit?.patient?.person?.display || 'Patient'}`,
      body: "Click notification to see!",
      type: type,
      data: {
        patientFirstName: this.patient.person.preferredName.givenName ?? '',
        patientMiddleName: this.patient.person.preferredName.middleName ?? '',
        patientLastName: this.patient.person.preferredName.familyName ?? '',
        patientUuid: this.patient.uuid,
        patientOpenMrsId: openMRSID,
        visitUuid: this.visit.uuid,
        followupDatetime: this.followUpDatetime
      }
    }
    this.mindmapService.notifyApp(hwUuid, payload).subscribe();
  }

  /**
   * Get Abha numner / Abha address from patient
   */
  getAbhaDetails(_patient: PatientModel): void {
    this.patient.person.abhaNumber = _patient.identifiers.find((v) => v.identifierType?.display?.toLowerCase() === 'abha number')?.identifier
    this.patient.person.abhaAddress = _patient.identifiers.find((v) => v.identifierType?.display?.toLowerCase() === 'abha address')?.identifier
  }

  updateAbhaDetails(encounterUUID: string): void {
    let mobileNumber = this.getPersonAttributeValue('Telephone Number');
    mobileNumber = mobileNumber != 'NA' ? mobileNumber : undefined
    const abhaNumber = this.patient?.person?.abhaNumber?.replace(/-/g, '');
    const abhaAddress = this.patient?.person?.abhaAddress ?? (abhaNumber ? `${abhaNumber}@sbx` : undefined);
    if (abhaNumber || abhaAddress || mobileNumber) {
      // Added call to generate linking token and add isABDMLink attribute 
      this.visitService.postAttribute(this.visit.uuid,
        {
          attributeType: '8ac6b1c7-c781-494a-b4ef-fb7d7632874f', /** Visit Attribute Type for isABDMLinked */
          value: false,
        }).subscribe(() => {
          const abhaNumber = this.patient?.person?.abhaNumber?.replace(/-/g, '');
          const openMRSID = this.getPatientIdentifier("OpenMRS ID")
          this.visitService.postVisitToABDM({
            openMRSID: openMRSID,
            mobileNumber: mobileNumber,
            visitUUID: this.visit.uuid,
            name: this.patient?.person?.display,
            gender: this.patient?.person?.gender,
            abhaNumber: abhaNumber,
            abhaAddress: abhaAddress,
            yearOfBirth: this?.patient?.person?.birthdate ? Number(this?.patient?.person?.birthdate?.substring(0, 4)) : null,
            startDateTime: this.visit.startDatetime,
            encounterUUID: encounterUUID,
            personDisplay: this.patient?.person?.display
          }).subscribe();
        });
    }
  }

  checkPatientRegField(fieldName: string): boolean {
    return this.patientRegFields.indexOf(fieldName) !== -1;
  }

  collapsedButton() {
    this.collapsed = !this.collapsed
  }

  getUrl(): string {
    return `assets/svgs/Vector${this.collapsed ? '-top' : '-bottom'}.svg`;
  }

  checkIsVisibleSection(pvsConfig: { key: string; is_enabled: boolean; }) {
    return checkIsEnabled(pvsConfig.key,
      pvsConfig.is_enabled, {
      visitCompleted: this.visitCompleted,
      visitEnded: this.visitEnded,
      visitNotePresent: this.visitNotePresent,
      hasVitalsEnabled: this.hasVitalsEnabled,
      notes_section: this.patientVisitSummary.notes_section,
      attachment_section: this.patientVisitSummary.attachment_section
    })
  }

  /**
  * Retrieve the appropriate language value from an element.
  * @param {any} element - An object containing `lang` and `name`.
  * @return {string} - The value in the selected language or the first available one.
  * Defaults to `element.name` if no language value is found.
  */
  getLanguageValue(element: any): string {
    return getFieldValueByLanguage(element)
  }

  /**
   * Handles changes to the call status and updates the reasons list accordingly.
   * @param {Event} event - The change event from the call status input.
   * @return {void}
   */
  onCallStatusChange(isLoad:boolean = false): void {
    if(this.patientCallStatusForm.value.callStatus){
      this.reasonsList = this.reasons[this.patientCallStatusForm.value.callStatus] || [];
      if(!isLoad) {
        this.patientCallStatusForm.patchValue({ reason: null });
        this.editFormValues = true;
        setTimeout(() => this.reasonSelectComponent?.open(), 0);
      }
    }
  }

  /**
   * @param {string} sectionKey - The key of the section.
   * @param {string} [subSectionName] - The name of the subsection (optional).
   * @returns {boolean} - True if the subsection is enabled, false otherwise.
   */
  isSubSectionEnabled(sectionKey: string, subSectionName?: string): boolean {
    const section = this.pvsConfigs.find(sec => sec.key === sectionKey);

    if (!section || !section.is_enabled) return false;
    if (!subSectionName) return true;

    const subSection = section.sub_sections?.find(sub => sub.name === subSectionName);
    return subSection ? subSection.is_enabled : false;
  }

  isFeatureAvailable(featureName: string, notInclude = false): boolean {
    return isFeaturePresent(featureName, notInclude);
  }

  /**
  * End WhatsApp Call
  * @returns {void}
  */
  endWhatsAppCall(){
    this.isCallInProgress = false;
    this.isWhatsappCallWarningShown = false;
    this.callTimerInterval.unsubscribe();
    this.arrCallDurations.push({callDuration:this.callDuration,timestamp:this.callDurationTimeStamp})
    if(this.callDurationsUuid) 
      this.visitService.updateAttribute(this.visit.uuid, this.callDurationsUuid, { attributeType : visitAttributeTypes.patientCallDuration, value: JSON.stringify(this.arrCallDurations) }).subscribe();
    else
      this.visitService.postAttribute(this.visit.uuid, { attributeType : visitAttributeTypes.patientCallDuration, value: JSON.stringify(this.arrCallDurations) }).subscribe();
  }

  /**
  * Start WhatsApp Call
  * @param {boolean} isScroll - Array of visit attributes
  * @returns {void}
  */
  startWhatsAppCall(isScroll:boolean = false){
    if(this.isFeatureAvailable('callDuration') && this.isVisitNoteProvider){
      if(isScroll) document.getElementById('patientInteractionFormTemplate').scrollIntoView({behavior: 'smooth'})
      if(!this.isCallInProgress){
        this.isCallInProgress = true;
        this.callDurationTimeStamp = Date.now()
          this.callTimerInterval = interval(1000).subscribe(val=>{
          this.callDuration = val;
        })
      }
    }
  }

  /**
  * Check if patient call durations visit attrubute present or not
  * @param {VisitAttributeModel[]} attributes - Array of visit attributes
  * @returns {void}
  */
  checkIfPatientCallDurationPresent(attributes: VisitAttributeModel[]): void {
    this.callDuration = 0;
    attributes.forEach((attr: VisitAttributeModel) => {
      if (attr.attributeType.uuid === visitAttributeTypes.patientCallDuration && attr.value) {
        this.arrCallDurations = JSON.parse(attr.value);
        this.callDuration = this.arrCallDurations?.slice(-1).pop()?.callDuration
        this.callDurationsUuid = attr.uuid
      }
    });
  }

  /**
  * Check if patient call status visit attrubute present or not
  * @param {VisitAttributeModel[]} attributes - Array of visit attributes
  * @returns {void}
  */
  checkIfCallStatusPresent(attributes: VisitAttributeModel[]): void {
    if(this.isMCCUser || !this.isVisitNoteProvider || this.visitEnded) this.patientCallStatusForm.get('reason').disable()
    attributes.forEach((attr: VisitAttributeModel) => {
      if (attr.attributeType.uuid === visitAttributeTypes.callStatus && attr.value) {
        this.patientCallStatusForm.patchValue({...obsParse(attr.value,attr.uuid)})
        this.onCallStatusChange(true)
      }
    });
  }

  openPatientCallHistory(){
    this.coreService.openPatientCallDurationHistoryModel({
      data:this.arrCallDurations?.slice(0, -1)
    })
  }

  getCallDuration(val:number){
    return getCallDuration(val)
  }

  autoGrowTextZone(e:any){
    return autoGrowTextZone(e)
  }

  saveRecommendation(): Observable<any>{
    if(this.recommendationForm.value.uuid){
      if(this.recommendationForm.valid)
        return this.encounterService.updateObs(this.recommendationForm.value.uuid,{
          value: `${this.recommendationForm.value.value}`,
        }).pipe(tap((res: ObsModel)=>this.recommendationForm.patchValue({uuid:res.uuid})))
      else 
        return this.diagnosisService.deleteObs(this.recommendationForm.value.uuid).pipe(tap((res)=>this.recommendationForm.patchValue({ uuid: null})))
    } else if(this.recommendationForm.valid) {
      return this.encounterService.postObs({
        concept: conceptIds.conceptRecommendation,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: `${this.recommendationForm.value.value}`,
        encounter: this.visitNotePresent.uuid,
      }).pipe(tap((res: ObsModel)=>this.recommendationForm.patchValue({uuid:res.uuid})))
    } else {
      return of(false)
    }
  }

  saveDiagnosisSecondary(): Observable<any>{
    if(this.diagnosisSecondaryForm.value.uuid){
      if(this.diagnosisSecondaryForm.valid)
        return this.encounterService.updateObs(this.diagnosisSecondaryForm.value.uuid,{
          value: `${obsStringify({...this.diagnosisSecondaryForm.value})}`,
        }).pipe(tap((res: ObsModel)=>this.diagnosisSecondaryForm.patchValue({uuid:res.uuid})))
      else
        return this.diagnosisService.deleteObs(this.diagnosisSecondaryForm.value.uuid).pipe(tap((res: ObsModel)=>this.diagnosisSecondaryForm.patchValue({uuid:null})))
    } else if(this.diagnosisSecondaryForm.valid) {
      return this.encounterService.postObs({
        concept: conceptIds.conceptDiagnosis,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: `${obsStringify({...this.diagnosisSecondaryForm.value})}`,
        encounter: this.visitNotePresent.uuid,
      }).pipe(tap((res: ObsModel)=>this.diagnosisSecondaryForm.patchValue({uuid:res.uuid})))
    } else {
      return of(false)
    }
  }

  saveDiscussionSummary(): Observable<any>{
    if(this.discussionSummaryForm.value.uuid){
      if(this.discussionSummaryForm.valid)
        return this.encounterService.updateObs(this.discussionSummaryForm.value.uuid,{
          value: `${this.discussionSummaryForm.value.value}`,
        }).pipe(tap((res: ObsModel)=>this.discussionSummaryForm.patchValue({uuid:res.uuid})))
      else 
        return this.diagnosisService.deleteObs(this.discussionSummaryForm.value.uuid).pipe(tap((res)=>this.discussionSummaryForm.patchValue({ uuid: null})))
    } else if(this.discussionSummaryForm.valid) {
      return this.encounterService.postObs({
        concept: conceptIds.conceptDiscussionSummary,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: `${this.discussionSummaryForm.value.value}`,
        encounter: this.visitNotePresent.uuid,
      }).pipe(tap((res: ObsModel)=>this.discussionSummaryForm.patchValue({uuid:res.uuid})))
    } else {
      return of(false)
    }
  }

  saveAllObs(): Observable<any> {
    const postObsRequests = [];

    // If changedFields is empty, save all fields
    if (!this.changedFields.length) {
      // Basic observations
      postObsRequests.push(
        this.saveHWInteraction(),
        this.savePatientInteraction(),
        this.saveAdditionalInstruction(),
        this.saveTest(),
        this.savePatientInteractionComment()
      );

      // Conditional observations based on config
      if (this.isFeatureAvailable('dp_diagnosis_secondary')) {
        postObsRequests.push(this.saveDiagnosisSecondary());
      }
      if (this.isFeatureAvailable('dp_discussion_summary')) {
        postObsRequests.push(this.saveDiscussionSummary());
      }
      if (this.isFeatureAvailable('doctor-recommendation')) {
        postObsRequests.push(this.saveRecommendation());
      }
      if (this.isFeatureAvailable('follow-up-instruction')) {
        postObsRequests.push(this.followUpInstructionComponentRef?.addInstructions());
      }
      if (this.isFeatureAvailable('dp_call_status')) {
        postObsRequests.push(this.saveCallStatus());
      }

      // Handle medicines
      for (const medicine of this.medicines) {
        if (medicine?.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptMed,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: `${medicine.drug ?? ''}:${medicine.strength ?? ''}:${medicine.days ?? ''}:${medicine.timing ?? ''}:${medicine.remark ?? ''}:${medicine.frequency ?? ''}`,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res: ObsModel) => medicine.uuid = res.uuid))
        );
      }

      // Handle advices
      for (const advice of this.advices) {
        if (advice?.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptAdvice,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: advice.value,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res: ObsModel) => advice.uuid = res.uuid))
        );
      }

      // Handle tests
      for (const test of this.tests) {
        if (test?.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptTest,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: test.value,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res: ObsModel) => test.uuid = res.uuid))
        );
      }

      // Handle diagnosis
      if (!this.isFeatureAvailable('dp_diagnosis_secondary')) {
        for (const diagnosis of this.existingDiagnosis) {
          if (diagnosis?.uuid) continue;
          postObsRequests.push(
            this.encounterService.postObs({
              concept: conceptIds.conceptDiagnosis,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: `${this.diagnosisCode?.value ? this.diagnosisCode?.value : 'NA'}::${diagnosis.diagnosisName ?? ''}:${diagnosis.diagnosisType ?? ''} & ${diagnosis.diagnosisStatus ?? ''}`,
              encounter: this.visitNotePresent.uuid
            }).pipe(tap((res: ObsModel) => diagnosis.uuid = res.uuid))
          );
          if (diagnosis?.isSnomed && isFeaturePresent("snomedCtDiagnosis")) {
            postObsRequests.push(this.diagnosisService.addSnomedDiagnosis(diagnosis.diagnosisName, diagnosis.diagnosisCode));
          }
        }
      }

      // Handle referrals
      for (const referral of this.referrals) {
        if (referral.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptReferral,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: `${referral.speciality??''}:${referral.facility??''}:${referral.priority??''}:${referral?.reason??''}`,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res: ObsModel) => referral.uuid = res.uuid))
        );
      }

      // Handle notes
      if (this.notesRef) {
        for (const note of this.notesRef.notes) {
          if (note.uuid) continue;
          postObsRequests.push(
            this.encounterService.postObs({
              concept: conceptIds.conceptNote,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: note.value,
              encounter: this.visitNotePresent.uuid
            }).pipe(tap((res: ObsModel) => note.uuid = res.uuid))
          );
        }
      }

      // Handle family history notes
      if (this.familyHistoryNoteRef) {
        for (const note of this.familyHistoryNoteRef.notes) {
          if (note.uuid) continue;
          postObsRequests.push(
            this.encounterService.postObs({
              concept: conceptIds.conceptFamilyHistoryNotes,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: note.value,
              encounter: this.visitNotePresent.uuid
            }).pipe(tap((res: ObsModel) => note.uuid = res.uuid))
          );
        }
      }

      // Handle past medical history notes
      if (this.pastMedicalHistoryNoteRef) {
        for (const note of this.pastMedicalHistoryNoteRef.notes) {
          if (note.uuid) continue;
          postObsRequests.push(
            this.encounterService.postObs({
              concept: conceptIds.conceptPastMedicalHistoryNotes,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: note.value,
              encounter: this.visitNotePresent.uuid
            }).pipe(tap((res: ObsModel) => note.uuid = res.uuid))
          );
        }
      }
    } else {
      // If changedFields has values, only save those specific fields
      const observationHandlers = {
        hwInteraction: () => this.saveHWInteraction(),
        patientInteraction: () => this.savePatientInteraction(),
        additionalInstruction: () => this.saveAdditionalInstruction(),
        test: () => this.saveTest(),
        patientInteractionComment: () => this.savePatientInteractionComment(),
        diagnosisSecondary: () => this.isFeatureAvailable('dp_diagnosis_secondary') ? this.saveDiagnosisSecondary() : of(null),
        discussionSummary: () => this.isFeatureAvailable('dp_discussion_summary') ? this.saveDiscussionSummary() : of(null),
        recommendation: () => this.isFeatureAvailable('doctor-recommendation') ? this.saveRecommendation() : of(null),
        followUpInstruction: () => this.isFeatureAvailable('follow-up-instruction') ? this.followUpInstructionComponentRef.addInstructions() : of(null),
        patientCallStatus: () => this.isFeatureAvailable('dp_call_status') ? this.saveCallStatus() : of(null)
      };

      // Add handlers for specific fields
      this.changedFields.forEach(field => {
        if (observationHandlers[field]) {
          postObsRequests.push(observationHandlers[field]());
        }
      });

      // Handle medicines if addMedicine is in changedFields
      if (this.changedFields.includes('addMedicine')) {
        for (const medicine of this.medicines) {
          if (medicine?.uuid) continue;
          postObsRequests.push(
            this.encounterService.postObs({
              concept: conceptIds.conceptMed,
              person: this.visit.patient.uuid,
              obsDatetime: new Date(),
              value: `${medicine.drug ?? ''}:${medicine.strength ?? ''}:${medicine.days ?? ''}:${medicine.timing ?? ''}:${medicine.remark ?? ''}:${medicine.frequency ?? ''}`,
              encounter: this.visitNotePresent.uuid
            }).pipe(tap((res: ObsModel) => medicine.uuid = res.uuid))
          );
        }
      }
      // Advices - only save new advices
      if (this.changedFields.includes('addAdvice')) {
        for (const advice of this.advices) {
          if(advice?.uuid) continue;
          postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptAdvice,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: advice.value,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res:ObsModel)=>advice.uuid=res.uuid))
        );
      }

      // Advices - only save new advices
      if (this.changedFields.includes('addTests')) {
        for (const test of this.tests) {
          if(test?.uuid) continue;
          postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptTest,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: test.value,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res:ObsModel)=>test.uuid=res.uuid)));
        } 
      }
    }

    // Diagnosis - only save new diagnoses
    if (this.changedFields.includes('diagnosis') && !this.isFeatureAvailable('dp_diagnosis_secondary')) {
      for (const diagnosis of this.existingDiagnosis) {
        if (diagnosis?.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptDiagnosis,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: `${this.diagnosisCode?.value ? this.diagnosisCode?.value : 'NA'}::${diagnosis.diagnosisName ?? ''}:${diagnosis.diagnosisType ?? ''} & ${diagnosis.diagnosisStatus ?? ''}`,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res:ObsModel)=>diagnosis.uuid=res.uuid))
        );
        if (diagnosis?.isSnomed && isFeaturePresent("snomedCtDiagnosis")) {
          postObsRequests.push(this.diagnosisService.addSnomedDiagnosis(diagnosis.diagnosisName, diagnosis.diagnosisCode))
        }
      }
    }

    // Referrals - only save new referrals
    if (this.changedFields.includes('addReferral')) {
      for (const referral of this.referrals) {
        if(referral.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptReferral,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: `${referral.speciality ?? ''}:${referral.facility ?? ''}:${referral.priority ?? ''}:${referral?.reason ?? ''}`,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res:ObsModel)=>referral.uuid=res.uuid))
        );
      }
    }

    // Notes - only save new notes
    if (this.changedFields.includes('notes') && this.notesRef) {
      for (const note of this.notesRef.notes) {
        if(note.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptNote,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: note.value,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res:ObsModel)=>note.uuid=res.uuid))
        );
      }
    }

    // Family History Notes - only save new notes
    if (this.changedFields.includes('familyHistoryNote') && this.familyHistoryNoteRef) {
      for (const note of this.familyHistoryNoteRef.notes) {
        if(note.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptFamilyHistoryNotes,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: note.value,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res:ObsModel)=>note.uuid=res.uuid))
        );
      }
    }

    // Past Medical History Notes - only save new notes
    if (this.changedFields.includes('pastMedicalHistoryNote') && this.pastMedicalHistoryNoteRef) {
      for (const note of this.pastMedicalHistoryNoteRef.notes) {
        if(note.uuid) continue;
        postObsRequests.push(
          this.encounterService.postObs({
            concept: conceptIds.conceptPastMedicalHistoryNotes,
            person: this.visit.patient.uuid,
            obsDatetime: new Date(),
            value: note.value,
            encounter: this.visitNotePresent.uuid
          }).pipe(tap((res:ObsModel)=>note.uuid=res.uuid))
        );
      }
    }
    }

    return postObsRequests.length > 0 ? forkJoin(postObsRequests) : of(null);
  }

  /**
   * Save all changes as draft
   */

  
  saveAsDraft() {
    // Get all fields that have been changed
    this.changedFields = Object.keys(this.updatedObsData).filter(key => 
      this.updatedObsData[key] !== this.obsData[key]
    );

    this.saveAllObs().subscribe({
      next: (responses) => {     
        // Unsubscribe from all existing subscriptions
        this.unsubscribeFromFormTracking();
        
        // Reset tracking states
        this.obsData = {
          notes: [],
          familyHistoryNote: [],
          pastMedicalHistoryNote: [], 
          followUp: false,
          followUpInstruction: this.followUpInstructionComponentRef?.addInstructionForm?.value?.instructions || [],
          diagnosis: [],
          addMedicine: [],
          additionalInstruction: null,
          addAdvice: [],
          addTests: [],
          test: null,
          addReferral: [],
          discussionSummary: null,
          patientCallStatus: null,
          diagnosisSecondary: null,
          recommendation: null,
          patientInteractionComment: null,
          hwInteraction: null,
          patientInteraction: null,
          medicine: []
        };
        
        // Update base state and reset tracking state
        this.updatedObsData = {...this.obsData};
        this.changesMade = false;
        
        // Reinitialize form tracking
        this.trackFormChanges();
        
        this.toastr.success(this.translateService.instant('Changes saved successfully'), this.translateService.instant('Success'));
      },
      error: (error) => {
        console.error('Error saving observations', error);
        this.toastr.error(this.translateService.instant('Error saving changes'), this.translateService.instant('Error'));
      }
    });
  }

  // Add new method to handle unsubscribing
  private formSubscriptions: Subscription[] = [];

  private unsubscribeFromFormTracking() {
    this.formSubscriptions.forEach(sub => {
      if (sub && !sub.closed) {
        sub.unsubscribe();
      }
    });
    this.formSubscriptions = [];
  }

  private trackFormChanges() {
    // Initialize updatedObsData with initial values from obsData
    this.updatedObsData = {...this.obsData};
    this.changesMade = false;

    // Track follow-up instructions
    if (this.followUpInstructionComponentRef) {
      // Store initial value
      this.obsData.followUpInstruction = this.followUpInstructionComponentRef.addInstructionForm?.value?.instructions || [];
      
      // Subscribe to the entire form value changes
      this.formSubscriptions.push(
        this.followUpInstructionComponentRef.addInstructionForm?.valueChanges.subscribe(() => {
          const newValue = this.followUpInstructionComponentRef.addInstructionForm?.value?.instructions || [];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.followUpInstruction)) {
            this.updatedObsData.followUpInstruction = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track patient interaction comment form
    if (this.patientInteractionCommentForm) {
      this.obsData.patientInteractionComment = this.patientInteractionCommentForm.value.value;
      
      this.formSubscriptions.push(
        this.patientInteractionCommentForm.valueChanges.subscribe(() => {
          const newValue = this.patientInteractionCommentForm.value.value;
          if (newValue !== this.obsData.patientInteractionComment) {
            this.updatedObsData.patientInteractionComment = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track follow-up form
    if (this.followUpForm) {
      this.obsData.followUp = false;
      
      this.formSubscriptions.push(
        this.followUpForm.valueChanges.subscribe(() => {
          this.updatedObsData.followUp = true;
          this.checkChanges(this.updatedObsData);
        })
      );
    }

    // Track notes forms
    if (this.notesRef) {
      this.obsData.notes = [...this.notesRef.notes];
      
      this.formSubscriptions.push(
        this.notesRef.addNoteForm.valueChanges.subscribe(() => {
          const newValue = [...this.notesRef.notes];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.notes)) {
            this.updatedObsData.notes = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    if (this.familyHistoryNoteRef) {
      this.obsData.familyHistoryNote = [...this.familyHistoryNoteRef.notes];
      
      this.formSubscriptions.push(
        this.familyHistoryNoteRef.addNoteForm.valueChanges.subscribe(() => {
          const newValue = [...this.familyHistoryNoteRef.notes];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.familyHistoryNote)) {
            this.updatedObsData.familyHistoryNote = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    if (this.pastMedicalHistoryNoteRef) {
      this.obsData.pastMedicalHistoryNote = [...this.pastMedicalHistoryNoteRef.notes];
      
      this.formSubscriptions.push(
        this.pastMedicalHistoryNoteRef.addNoteForm.valueChanges.subscribe(() => {
          const newValue = [...this.pastMedicalHistoryNoteRef.notes];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.pastMedicalHistoryNote)) {
            this.updatedObsData.pastMedicalHistoryNote = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track diagnosis form
    if (this.diagnosisForm) {
      this.obsData.diagnosis = [...this.existingDiagnosis];
      
      this.formSubscriptions.push(
        this.diagnosisForm.valueChanges.subscribe(() => {
          const newValue = [...this.existingDiagnosis];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.diagnosis)) {
            this.updatedObsData.diagnosis = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track medicine form
    if (this.addMedicineForm) {
      this.obsData.addMedicine = [...this.medicines];
      
      this.formSubscriptions.push(
        this.addMedicineForm.valueChanges.subscribe(() => {
          const newValue = [...this.medicines];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.addMedicine)) {
            this.updatedObsData.addMedicine = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track additional instruction form
    if (this.additionalInstructionForm) {
      this.obsData.additionalInstruction = this.additionalInstructionForm.value.value;
      
      this.formSubscriptions.push(
        this.additionalInstructionForm.valueChanges.subscribe(() => {
          const newValue = this.additionalInstructionForm.value.value;
          if (newValue !== this.obsData.additionalInstruction) {
            this.updatedObsData.additionalInstruction = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track advice form
    if (this.addAdviceForm) {
      this.obsData.addAdvice = [...this.advices];
      
      this.formSubscriptions.push(
        this.addAdviceForm.valueChanges.subscribe(() => {
          const newValue = [...this.advices];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.addAdvice)) {
            this.updatedObsData.addAdvice = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track add test form
    if (this.addTestForm) {
      this.obsData.addTests = [...this.tests];
      
      this.formSubscriptions.push(
        this.addTestForm.valueChanges.subscribe(() => {
          const newValue = [...this.tests];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.addTests)) {
            this.updatedObsData.addTests = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track test form
    if (this.testForm) {
      this.obsData.test = this.testForm.value.test;
      
      this.formSubscriptions.push(
        this.testForm.valueChanges.subscribe(() => {
          const newValue = this.testForm.value.test;
          if (newValue !== this.obsData.test) {
            this.updatedObsData.test = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track referral form
    if (this.addReferralForm) {
      this.obsData.addReferral = [...this.referrals];
      
      this.formSubscriptions.push(
        this.addReferralForm.valueChanges.subscribe(() => {
          const newValue = [...this.referrals];
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.addReferral)) {
            this.updatedObsData.addReferral = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track discussion summary form
    if (this.discussionSummaryForm) {
      this.obsData.discussionSummary = this.discussionSummaryForm.value.value;
      
      this.formSubscriptions.push(
        this.discussionSummaryForm.valueChanges.subscribe(() => {
          const newValue = this.discussionSummaryForm.value.value;
          if (newValue !== this.obsData.discussionSummary) {
            this.updatedObsData.discussionSummary = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track diagnosis secondary form
    if (this.diagnosisSecondaryForm) {
      this.obsData.diagnosisSecondary = this.diagnosisSecondaryForm.value;
      
      this.formSubscriptions.push(
        this.diagnosisSecondaryForm.valueChanges.subscribe(() => {
          const newValue = this.diagnosisSecondaryForm.value;
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.diagnosisSecondary)) {
            this.updatedObsData.diagnosisSecondary = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track recommendation form
    if (this.recommendationForm) {
      this.obsData.recommendation = this.recommendationForm.value;
      this.formSubscriptions.push(
        this.recommendationForm.valueChanges.subscribe(() => {
          const newValue = this.recommendationForm.value;
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.recommendation)) {
            this.updatedObsData.recommendationForm = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }

    // Track patient call status form
    if (this.patientCallStatusForm) {
      this.obsData.patientCallStatus = {
        callStatus: this.patientCallStatusForm.value.callStatus,
        reason: this.patientCallStatusForm.value.reason
      };
      
      this.formSubscriptions.push(
        this.patientCallStatusForm.valueChanges.subscribe(() => {
          const newValue = {
            callStatus: this.patientCallStatusForm.value.callStatus,
            reason: this.patientCallStatusForm.value.reason
          };
          if (JSON.stringify(newValue) !== JSON.stringify(this.obsData.patientCallStatus)) {
            this.updatedObsData.patientCallStatus = newValue;
            this.checkChanges(this.updatedObsData);
          }
        })
      );
    }
  }

  /**
   * Check for changes and update changesMade flag
   * @param updatedObsData - The updated observation data to check against the base state
   * @returns {boolean} - Returns true if edit form values are disabled
   */
  private checkChanges(updatedObsData: any): boolean {
    if (!this.editFormValues) {
      return true;
    }

    if(this.isFeatureAvailable("callDuration") && this.isCallInProgress && (!this.isWhatsappCallWarningShown)){
      this.onWhatsappOngoingDialog();
    }

    // Compare actual values instead of just checking boolean flags
    const changedFields = Object.keys(updatedObsData).filter(key => {
      // For arrays, compare stringified versions
      if (Array.isArray(updatedObsData[key])) {
        return JSON.stringify(updatedObsData[key]) !== JSON.stringify(this.obsData[key]);
      }
      // For objects, compare stringified versions
      if (typeof updatedObsData[key] === 'object' && updatedObsData[key] !== null) {
        return JSON.stringify(updatedObsData[key]) !== JSON.stringify(this.obsData[key]);
      }
      // For primitive values, compare directly
      return updatedObsData[key] !== this.obsData[key];
    });

    this.changesMade = changedFields.length > 0;
    return false;
  }

  /**
   * Handler for instructions changes from follow-up instruction component
   */
  onInstructionsChanged(): void {
    this.updatedObsData.followUpInstruction = true;
    this.checkChanges(this.updatedObsData);
  }

  /**
  * confirm exit this page without saving data
  * @return {void}
  */
  public onExitPageConfirmDialog(nextRouteURL, msg: string): void{
    this.coreService.openConfirmationDialog({ confirmationMsg: msg, cancelBtnText: 'Stay Here', confirmBtnText: 'Exit' }).afterClosed().subscribe(res=>{
      if(res){
        this.changesMade = false;
        this.isCallInProgress = false;
        this.router.navigate([nextRouteURL]);
      }
    });
  }

  /**
  * confirm exit this page without saving data
  * @return {void}
  */
  public onWhatsappOngoingDialog(): void{
    this.coreService.openConfirmationDialog({ confirmationMsg: "Please end the call to proceed", cancelBtnText: 'Close', confirmBtnText: 'End Call' }).afterClosed().subscribe(res=>{
      if(res){
        this.endWhatsAppCall();
      } else {
        this.isWhatsappCallWarningShown = true;
      }
    });
  }

  /**
  * page click event
  * @return {void}
  */
  pageClick(event: any): void{
    console.log(event)
  }


  onCallStatusClick(value: string): void{
    if(this.patientCallStatusForm.get('callStatus').value === value){
      this.patientCallStatusForm.get('callStatus').setValue(null)
    }
    return null;
  }

  getPhoneNumber(getPatientNo: boolean = false): string{
    if(["KCDO"].includes(environment.brandName) || getPatientNo){
      return this.getPersonAttributeValue('Telephone Number') != "NA" ? this.getPersonAttributeValue('Telephone Number') : "";
    } else {
      return this.hwPhoneNo;
    } 
  }

  /**
   * Log user event and save to visit attribute
   */
  logUserEvent(eventType: string) {
    const event = {
      type: eventType,
      timestamp: new Date().toISOString()
    };
    this.eventLog.push(event);
    const payload = {
      attributeType: '98660a74-9f8b-41d5-b142-ed3f22684068', // TODO: Visit_Provider_Activity_Logs
      value: JSON.stringify(this.eventLog)
    };
    if (this.eventLogAttributeUuid) {
      this.visitService.updateAttribute(this.visit.uuid, this.eventLogAttributeUuid, payload).subscribe();
    } else {
      this.visitService.postAttribute(this.visit.uuid, payload).subscribe((res: any) => {
        this.eventLogAttributeUuid = res.uuid;
      });
    }
  }
}