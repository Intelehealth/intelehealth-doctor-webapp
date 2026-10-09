import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientModel, VisitModel } from 'src/app/model/model';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { deleteCacheData, getCacheData, isNamcoDoctor, setCacheData } from 'src/app/utils/utility-functions';
import { CoreService } from 'src/app/services/core/core.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { VisitSummaryHelperService } from 'src/app/services/visit-summary-helper.service';
import {
  ComplaintDetail, DetailRow, DocItem, NavGroup, Patient, PastVisit,
  SectionNavItem, SymptomGroup, TimelineGroup, VitalCell
} from './visit-summary-v2.models';
import { CurrentVisitData, VisitSummaryV2Service } from './visit-summary-v2.service';
import { MindmapService } from 'src/app/services/mindmap.service';
import { CurrentVisitDetailsComponent } from './current-visit-details/current-visit-details.component';
import { PrimaryNoteViewComponent } from './primary-note-view/primary-note-view.component';
import { SpecialistDoctorNoteComponent } from './specialist-doctor-note/specialist-doctor-note.component';
import { VISIT_SECTIONS } from 'src/app/utils/visit-sections';
import {
  CURRENT_VISITS_TITLE, PRIMARY_NOTE_TITLE, SPECIALIST_NOTE_TITLE
} from './specialist-doctor-note/specialist-doctor-note.constants';

@Component({
  selector: 'app-visit-summary-v2',
  templateUrl: './visit-summary-v2.component.html',
  styleUrls: ['./visit-summary-v2.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VisitSummaryV2Component implements OnInit, OnDestroy {
  visitId = '';

  /** Top tab / sidebar group for the logged-in doctor's own note. */
  noteTab = 'Doctor\'s Note';
  topTabs = ['Current visits', this.noteTab];
  activeTopTab = 'Current visits';

  /** NAMCO specialist: works in their own Specialist Doctor's Note (Specialist Visit Note encounter). */
  isNamcoDoctorLoggedIn = false;

  visitNoteStarted = false;
  isStartingVisitNote = false;

  readonly currentVisitsTab = CURRENT_VISITS_TITLE;
  readonly primaryNoteTab = PRIMARY_NOTE_TITLE;

  /** Which of the Current visits / Primary / (Specialist) Doctor's Note cards are expanded. */
  expandedCards: Record<string, boolean> = { [CURRENT_VISITS_TITLE]: true };
  private cardsInitialised = false;

  @ViewChild(CurrentVisitDetailsComponent) private currentVisitDetails?: CurrentVisitDetailsComponent;
  @ViewChild(PrimaryNoteViewComponent) private primaryNoteView?: PrimaryNoteViewComponent;
  @ViewChild(SpecialistDoctorNoteComponent) private specialistNote?: SpecialistDoctorNoteComponent;

  /** Sidebar groups below the Current visits sections — one per doctor's note shown. */
  noteNavGroups: NavGroup[] = [];

  /** Top tabs shown right now — kept in step with the sidebar groups by refreshNavigation(). */
  visibleTopTabs: string[] = [CURRENT_VISITS_TITLE];

  visitScopeTabs = ['Current visits', 'Past Visits'];
  activeVisitScope = 'Current visits';

  sections: SectionNavItem[] = [
    { key: 'consultation', label: 'Consultation details', icon: 'assets/svgs/consultation-details.svg' },
    { key: 'checkup', label: 'Check-up reason', icon: 'assets/svgs/check-up-reason.svg' },
    { key: 'vitals', label: 'Vitals', icon: 'assets/svgs/vitals.svg' },
    { key: 'history', label: 'Medical history', icon: 'assets/svgs/medical-history.svg' },
    { key: 'physical', label: 'Physical examination', icon: 'assets/svgs/physical-examination.svg' },
    { key: 'documents', label: 'Additional documents', icon: 'assets/svgs/additional-documents.svg' },
    { key: 'refer', label: 'Refer to specialist', icon: 'assets/svgs/refer-to-specialist.svg' }
  ];
  activeSection = 'consultation';

  /** "Refer to specialist" is controlled from Admin Actions > Patient Visit Sections. */
  referToSpecialistEnabled = true;

  /** Doctor's note sections; each note's sidebar keys are "<prefix>-<key>" (its section ids). */
  private static readonly NOTE_NAV: SectionNavItem[] = [
    { key: 'interaction', label: 'Patient interaction', icon: 'assets/svgs/patient-interaction.svg' },
    { key: 'diagnosis', label: 'Diagnosis', icon: 'assets/svgs/diagnosis.svg' },
    { key: 'note', label: 'Note', icon: 'assets/svgs/note.svg' },
    { key: 'medication', label: 'Medication', icon: 'assets/svgs/medication.svg' },
    { key: 'advice', label: 'Advice', icon: 'assets/svgs/advice.svg' },
    { key: 'test', label: 'Test', icon: 'assets/svgs/test.svg' },
    { key: 'referral', label: 'Referral-Out', icon: 'assets/svgs/referal.svg' },
    { key: 'followup', label: 'Follow-up', icon: 'assets/svgs/follow-up.svg' }
  ];
  private readonly doctorNoteNav = VisitSummaryV2Component.noteNav('dn');
  private readonly specialistNoteNav = VisitSummaryV2Component.noteNav('sdn');
  private readonly primaryNoteNav = VisitSummaryV2Component.noteNav('pdn');

  private static noteNav(prefix: string): SectionNavItem[] {
    return VisitSummaryV2Component.NOTE_NAV.map(item => ({ ...item, key: `${prefix}-${item.key}` }));
  }

  patient: Patient | null = null;
  consultationDetails: DetailRow[] = [];
  chiefComplaints: string[] = [];
  complaintDetails: ComplaintDetail[] = [];
  associatedSymptoms: SymptomGroup[] = [];
  patientHistory: DetailRow[] = [];
  familyHistory: DetailRow[] = [];
  vitals: VitalCell[] = [];
  generalExams: DetailRow[] = [];
  eyeImages: string[] = [];
  abdomenFindings: string[] = [];
  documents: DocItem[] = [];
  specializations: string[] = [];

  chwNote = 'This history note and physical exam note was generated by a community health worker with the support of the Intelehealth mobile application and Ayu, a digital assistant. It collects only preliminary findings and may not gather all of the patient\'s clinical information, especially sensitive information or complex physical exam information which is hard for the health worker to collect. Please verify crucial clinical information and collect any additional information you require by speaking with the patient directly.';

  activePastVisitKey = '';

  pastVisitsTimeline: TimelineGroup[] = [];

  get activePastVisit(): PastVisit | undefined {
    for (const group of this.pastVisitsTimeline) {
      const found = group.visits.find(v => v.key === this.activePastVisitKey);
      if (found) { return found; }
    }
    return this.pastVisitsTimeline[0]?.visits[0];
  }

  visit!: VisitModel;
  visitNoteExists = false;
  visitNoteUuid = '';
  noteEncounterUuids: string[] = [];
  primaryVisitNoteExists = false;
  primaryVisitNoteUuid = '';
  visitCompleted = false;
  patientUuid = '';
  private providerUuid = '';

  patientModel!: PatientModel;
  clinicName = '';
  visitEnded = false;
  visitReferred = false;
  isVisitNoteProvider = false;
  hasWebRTCEnabled = false;
  hasAudioEnabled = false;
  hasVideoEnabled = false;
  hasChatEnabled = false;
  isCalling = false;
  private openChatFlag = false;
  private callDialogRef: MatDialogRef<any> | undefined;
  private chatDialogRef: MatDialogRef<any> | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    private v2Service: VisitSummaryV2Service,
    private appConfigService: AppConfigService,
    private analytics: AnalyticsService,
    private visitSummaryService: VisitSummaryHelperService,
    private mindmapService: MindmapService
  ) {
    this.openChatFlag = !!this.router.getCurrentNavigation()?.extras?.state?.openChat;
  }

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get('id') || '';
    const provider = getCacheData(true, doctorDetails.PROVIDER);
    this.providerUuid = provider?.uuid || '';
    this.isNamcoDoctorLoggedIn = isNamcoDoctor(provider || {});
    if (this.isNamcoDoctorLoggedIn) {
      this.noteTab = SPECIALIST_NOTE_TITLE;
      this.topTabs = [CURRENT_VISITS_TITLE, PRIMARY_NOTE_TITLE, this.noteTab];
    }
    this.hasWebRTCEnabled = !!this.appConfigService?.webrtc_section;
    this.hasAudioEnabled = !!this.appConfigService?.webrtc?.audio_call;
    this.hasVideoEnabled = !!this.appConfigService?.webrtc?.video_call;
    this.hasChatEnabled = !!this.appConfigService?.webrtc?.chat;
    this.referToSpecialistEnabled = this.isVisitSectionEnabled(VISIT_SECTIONS.refer_to_specialist.key);
    if (!this.referToSpecialistEnabled) {
      this.sections = this.sections.filter(s => s.key !== 'refer');
    }
    this.loadVisit();
  }

  ngOnDestroy(): void {
    if (this.callDialogRef) {
      this.callDialogRef.close();
      this.callDialogRef = undefined;
    }
    if (this.chatDialogRef) {
      this.chatDialogRef.close();
      this.chatDialogRef = undefined;
    }
    deleteCacheData(visitTypes.PATIENT_VISIT_PROVIDER);
  }

  private isVisitSectionEnabled(key: string): boolean {
    const section = (this.appConfigService?.patient_visit_sections || []).find(s => s.key === key);
    return !!section?.is_enabled;
  }

  get canStartCall(): boolean {
    return this.hasWebRTCEnabled && this.isVisitNoteProvider && !this.visitEnded && !this.isCalling;
  }

  /**
  * Start chat with HW/patient
  * @return {void}
  */
  startChat(): void {
    if (this.chatDialogRef) {
      this.chatDialogRef.close();
      this.chatDialogRef = undefined;
      this.isCalling = false;
      return;
    }
    if (!this.visit || !this.patientModel) { return; }

    this.isCalling = true;
    this.chatDialogRef = this.coreService.openChatBoxModal({
      patientId: this.visit.patient?.uuid,
      visitId: this.visit.uuid,
      patientName: this.patientModel.person?.display,
      patientPersonUuid: this.patientModel.person?.uuid,
      patientOpenMrsId: this.patient?.openMrsId
    });

    this.chatDialogRef.afterClosed().subscribe(() => {
      this.chatDialogRef = undefined;
      this.isCalling = false;
    });
  }

  /**
  * Auto-open the chat box when navigated here with the openChat state flag
  * @return {void}
  */
  private checkOpenChatBoxFlag(): void {
    if (this.openChatFlag && this.hasWebRTCEnabled && this.hasChatEnabled) {
      this.openChatFlag = false;
      setTimeout(() => this.startChat(), 1000);
    }
  }

  /**
  * Start audio/video call with HW/patient
  * @param {string} callType - 'audio' | 'video'
  * @return {void}
  */
  startCall(callType: string): void {
    if (this.callDialogRef) {
      this.callDialogRef.close();
      this.callDialogRef = undefined;
      this.isCalling = false;
      return;
    }
    if (!this.visit || !this.patientModel) { return; }

    this.cacheVisitProvider(this.visit);
    const visitProvider = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER);
    if (!visitProvider?.provider?.uuid) {
      this.coreService.openConfirmationDialog({
        confirmationMsg: 'This visit has no health worker linked to it, so the call cannot be connected.',
        cancelBtnText: 'Close',
        confirmBtnText: 'Ok'
      });
      return;
    }
    this.analytics.logEvent('start_call', 'engagement', 'call_button', 1, {
      doctorUserId: this.visitSummaryService.userId,
      doctorName: getCacheData(true, doctorDetails.USER)?.person?.display,
      patientOpenMrsId: this.patient?.openMrsId,
      hwName: visitProvider?.display?.split(':')?.[0],
      hwId: visitProvider?.provider?.uuid || null,
      visitId: this.visit.uuid,
      location: this.clinicName,
      callType
    });

    this.isCalling = true;
    this.callDialogRef = this.coreService.openVideoCallModal({
      patientId: this.visit.patient?.uuid,
      visitId: this.visit.uuid,
      connectToDrId: this.visitSummaryService.userId,
      patientName: this.patientModel.person?.display,
      patientPersonUuid: this.patientModel.person?.uuid,
      patientOpenMrsId: this.patient?.openMrsId,
      initiator: 'dr',
      drPersonUuid: getCacheData(true, doctorDetails.PROVIDER)?.person?.uuid,
      patientAge: this.patientModel.person?.age,
      patientGender: this.patientModel.person?.gender,
      location: this.clinicName,
      callType
    });

    this.callDialogRef.afterClosed().subscribe(() => {
      this.callDialogRef = undefined;
      this.isCalling = false;
    });
  }

  private loadVisit(): void {
    if (!this.visitId) { return; }
    this.v2Service.loadCurrentVisit(this.visitId, this.isNamcoDoctorLoggedIn).subscribe((data: CurrentVisitData) => {
      if (data) { this.applyCurrentVisit(data); }
    });
  }

  private applyCurrentVisit(data: CurrentVisitData): void {
    this.visit = data.visit;
    this.visitNoteExists = data.visitNoteExists;
    this.visitNoteUuid = data.visitNoteUuid;
    this.noteEncounterUuids = data.noteEncounterUuids;
    this.primaryVisitNoteExists = data.primaryVisitNoteExists;
    this.primaryVisitNoteUuid = data.primaryVisitNoteUuid;
    this.visitCompleted = data.visitCompleted;
    this.patientUuid = data.patientUuid;
    this.visitNoteStarted = data.visitNoteExists;
    this.specializations = data.specializations;
    this.patient = data.patient;
    this.patientModel = data.patientModel;
    this.clinicName = data.clinicName;
    this.visitEnded = data.visitEnded;
    this.visitReferred = data.visitReferred;
    this.isVisitNoteProvider = !!this.providerUuid && data.visitNoteProviderUuids.includes(this.providerUuid);
    this.consultationDetails = data.consultationDetails;
    this.chiefComplaints = data.chiefComplaints;
    this.complaintDetails = data.complaintDetails;
    this.associatedSymptoms = data.associatedSymptoms;
    this.patientHistory = data.patientHistory;
    this.familyHistory = data.familyHistory;
    this.vitals = data.vitals;
    this.generalExams = data.generalExams;
    this.abdomenFindings = data.abdomenFindings;
    this.eyeImages = data.eyeImages;
    this.documents = data.documents;
    this.cacheVisitProvider(this.visit);
    this.checkOpenChatBoxFlag();
    this.refreshNavigation();
    if (!this.cardsInitialised) {
      this.cardsInitialised = true;
      // NAMCO doctor: only Current visits is open by default — Primary / Specialist Doctor's Note
      // stay collapsed until picked. Otherwise open straight into the doctor's note once started.
      if (this.isNamcoDoctorLoggedIn) {
        this.openCard(CURRENT_VISITS_TITLE);
      } else if (this.visitNoteStarted) {
        this.openCard(this.noteTab);
      }
    }
    this.loadPastVisits();
  }

  /** Rebuild the top tabs and sidebar note groups; they only change when a note starts or loads. */
  private refreshNavigation(): void {
    this.visibleTopTabs = this.topTabs.filter(t => {
      if (t === this.noteTab) { return this.visitNoteStarted; }
      if (t === this.primaryNoteTab) { return !!this.primaryVisitNoteUuid; }
      return true;
    });
    if (!this.isNamcoDoctorLoggedIn) {
      this.noteNavGroups = this.visitNoteStarted ? [{ label: this.noteTab, items: this.doctorNoteNav }] : [];
      return;
    }
    const groups: NavGroup[] = [];
    if (this.primaryVisitNoteUuid) { groups.push({ label: PRIMARY_NOTE_TITLE, items: this.primaryNoteNav }); }
    if (this.visitNoteStarted) { groups.push({ label: this.noteTab, items: this.specialistNoteNav }); }
    this.noteNavGroups = groups;
  }

  /** Expand one card (collapsing the others), as in the design. */
  private openCard(card: string): void {
    this.expandedCards = { [card]: true };
    this.activeTopTab = card;
  }

  toggleCard(card: string): void {
    this.expandedCards = { ...this.expandedCards, [card]: !this.expandedCards[card] };
  }

  private cardAnchorId(card: string): string {
    if (card === this.noteTab) { return 'section-doctor-note'; }
    if (card === PRIMARY_NOTE_TITLE) { return 'card-primary-note'; }
    return 'card-current-visits';
  }

  /** Sidebar keys: "<section>", "pdn-<section>" (primary note) or "sdn-<section>" (specialist note). */
  private expandSection(key: string): void {
    if (key.startsWith('pdn-')) {
      this.primaryNoteView?.expandSection(key.slice(4));
    } else if (key.startsWith('sdn-')) {
      this.specialistNote?.expandSection(key.slice(4));
    } else if (!key.startsWith('dn-')) {
      this.currentVisitDetails?.expandSection(key);
    }
  }

  private scrollTo(id: string): void {
    // Wait a tick so a just-expanded card has rendered.
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }


  private cacheVisitProvider(visit: VisitModel): void {
    const encounter = (visit?.encounters || []).find(e => e.display?.match(visitTypes.ADULTINITIAL) !== null);
    const visitProvider = encounter?.encounterProviders?.[0];
    if (visitProvider) {
      setCacheData(visitTypes.PATIENT_VISIT_PROVIDER, JSON.stringify(visitProvider));
    }
  }

  private loadPastVisits(): void {
    if (!this.patientUuid || !this.visitId) { return; }
    this.v2Service.loadPastVisits(this.patientUuid, this.visitId).subscribe((timeline: TimelineGroup[]) => {
      this.pastVisitsTimeline = timeline;
      const first = timeline[0]?.visits[0];
      if (first) { this.activePastVisitKey = first.key; }
    });
  }

  setTopTab(tab: string): void {
    this.openCard(tab);
    this.scrollTo(this.cardAnchorId(tab));
  }

  setVisitScope(tab: string): void {
    this.activeVisitScope = tab;
  }

  selectPastVisit(key: string): void {
    this.activePastVisitKey = key;
  }

  selectSection(key: string): void {
    this.activeSection = key;
    this.expandSection(key);
    const card = key.startsWith('pdn-') ? PRIMARY_NOTE_TITLE
      : (key.startsWith('sdn-') || key.startsWith('dn-')) ? this.noteTab : CURRENT_VISITS_TITLE;
    this.expandedCards = { ...this.expandedCards, [card]: true };
    this.activeTopTab = card;
    this.scrollTo('section-' + key);
  }

  startVisitNote(): void {
    if (!this.visit || this.isStartingVisitNote) { return; }
    this.isStartingVisitNote = true;
    this.v2Service.createVisitNote(this.visit, this.providerUuid, this.isNamcoDoctorLoggedIn).subscribe({
      next: () => {
        this.isStartingVisitNote = false;
        this.notifyHwForVisitStarted();
        this.visitNoteExists = true;
        this.visitNoteStarted = true;
        this.refreshNavigation();
        this.loadVisit();
        setTimeout(() => this.setTopTab(this.noteTab));
      },
      error: () => {
        this.isStartingVisitNote = false;
      }
    });
  }

  private notifyHwForVisitStarted(): void {
    const hwUuid = getCacheData(true, visitTypes.PATIENT_VISIT_PROVIDER)?.provider?.uuid;
    this.mindmapService.notifyHwForVisitStarted(hwUuid, {
      visitUuid: this.visit?.uuid,
      patientUuid: this.patientUuid,
      patientOpenMrsId: this.patient?.openMrsId,
      doctorUuid: this.providerUuid
    });
  }

  reassignVisit(speciality: string): void {
    if (!this.visit) { return; }
    if (this.visitNoteExists || this.primaryVisitNoteExists) {
      this.coreService.showToast('warning', 'Can\'t refer, visit note already exists for this visit!', 'Can\'t refer', 'warning-visit-note-exists-toast');
      return;
    }
    if (!speciality) {
      this.coreService.showToast('warning', 'Please select specialization', 'Invalid!', 'warning-select-specialization-toast');
      return;
    }
    this.coreService.openConfirmationDialog({
      confirmationMsg: 'Are you sure to re-assign this visit to another doctor?',
      cancelBtnText: 'Cancel',
      confirmBtnText: 'Confirm'
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) { return; }
      this.v2Service.reassignSpeciality(this.visit, speciality, this.providerUuid).subscribe((res) => {
        if (res) {
          this.router.navigate(['/dashboard']);
          this.coreService.showToast('success', 'Visit has been re-assigned to the another speciality doctor successfully.', 'Visit Re-assigned!', 'visit-reassigned-toast');
        }
      });
    });
  }
}
