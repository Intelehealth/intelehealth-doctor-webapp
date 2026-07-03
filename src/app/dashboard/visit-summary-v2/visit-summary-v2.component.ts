import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Visit Summary V2 — brand-new UI for the doctor visit summary screen.
 *
 * This component is intentionally decoupled from the legacy
 * `VisitSummaryComponent`. It currently renders STATIC MOCK DATA so the layout
 * can be reviewed against the design. Once approved, the real API calls/services
 * from the legacy screen (VisitService, DiagnosisService, etc.) will be wired in
 * here, replacing the mock objects below.
 */

interface SectionNavItem {
  key: string;
  label: string;
  icon: string; // svg asset path
}

interface DetailRow {
  label: string;
  value: string;
  highlight?: boolean; // red emphasis e.g. "Priority visit"
}

interface ComplaintDetail {
  title: string;
  rows: DetailRow[];
}

interface SymptomGroup {
  label: string;   // "Patient reports" / "Patient denies"
  text: string;
}

interface VitalCell {
  label: string;
  value: string;
}

interface DocItem {
  type: 'image' | 'pdf';
  name?: string;
  src?: string;
}

interface PrescriptionData {
  doctor: { name: string; qualifications: string; speciality: string };
  diagnosis: { name: string; type: string; status: string }[];
  notes: string[];
  meds: { drug: string; strength: string; days: string; timing: string; remarks: string }[];
  instructions: string[];
  advice: string[];
  tests: string[];
  referral: { to: string; facility: string; priority: string; reason: string };
  followUp: { suggested: string; date: string; time: string; reason: string };
  docs: { name: string }[];
}

interface PastVisit {
  key: string;
  title: string;
  med: string;
  by: string;
  referred: boolean;
  diagnosis: string;
  consultation: DetailRow[];
  chiefComplaints: string[];
  prescription: PrescriptionData;
}

@Component({
  selector: 'app-visit-summary-v2',
  templateUrl: './visit-summary-v2.component.html',
  styleUrls: ['./visit-summary-v2.component.scss']
})
export class VisitSummaryV2Component implements OnInit {
  visitId: string;

  /** Top-level tabs */
  topTabs = ['Current visits', "Doctor's Note"];
  activeTopTab = 'Current visits';

  /** Left sidebar visit toggle */
  visitScopeTabs = ['Current visits', 'Past Visits'];
  activeVisitScope = 'Current visits';

  /** Left sidebar section navigation */
  sections: SectionNavItem[] = [
    { key: 'consultation', label: 'Consultation details', icon: 'assets/svgs/consultation-details.svg' },
    { key: 'checkup', label: 'Check-up reason', icon: 'assets/svgs/check-up-reason.svg' },
    { key: 'history', label: 'Medical history', icon: 'assets/svgs/medical-history.svg' },
    { key: 'vitals', label: 'Vitals', icon: 'assets/svgs/vitals.svg' },
    { key: 'physical', label: 'Physical examination', icon: 'assets/svgs/physical-examination.svg' },
    { key: 'documents', label: 'Additional documents', icon: 'assets/svgs/additional-documents.svg' },
    { key: 'refer', label: 'Refer to specialist', icon: 'assets/svgs/refer-to-specialist.svg' }
  ];
  activeSection = 'consultation';

  // ----- MOCK DATA (to be replaced with API data) -----

  patient = {
    name: 'Muskan Kala',
    gender: 'Female',
    tag: 'Pregnant',
    openMrsId: '163NR-2',
    avatar: 'assets/svgs/profile-image.svg',
    age: '32 Years',
    weight: '50Kg',
    allergies: ['Penicillin', 'Morphine'],
    extraAllergiesCount: 2,
    pregnancy: '24 Weeks/Normal',
    contactNo: '9876012345'
  };

  consultationDetails: DetailRow[] = [
    { label: 'Visit ID', value: 'VID1234' },
    { label: 'Appointment on', value: 'No appointment' },
    { label: 'Visit created', value: 'Mar 18, 2026, 5:46:09 PM' },
    { label: 'Status', value: 'Priority visit', highlight: true },
    { label: 'Visit uploaded', value: 'Mar 18, 2026, 5:57:40 PM' },
    { label: 'Location', value: 'Telemedicine clinic 1' }
  ];

  chiefComplaints = ['Abdominal pain', 'Back pain'];

  complaintDetails: ComplaintDetail[] = [
    {
      title: 'Abdominal pain',
      rows: [
        { label: 'Site', value: 'Upper (R) - Right Hypohondrium' },
        { label: 'Pain radiates to', value: 'Upper (C) - Epigastric' },
        { label: 'Onset', value: 'Rapidly increasing' },
        { label: 'Timing', value: 'Morning' },
        { label: 'Character of pain', value: 'Cramping' },
        { label: 'Severity', value: 'Moderate, 4-6' },
        { label: 'Exacerbating factors', value: 'Food movement' },
        { label: 'Relieving factor', value: 'Leaning forward' },
        { label: 'Menstrual history', value: 'Menstruating - 14,20 April 2022.' },
        { label: 'Prior treatment sought', value: 'None' },
        { label: 'Additional Information', value: 'Trouble sleep' }
      ]
    }
  ];

  associatedSymptoms: SymptomGroup[] = [
    {
      label: 'Patient reports',
      text: 'Nausea, Anorexia, Constipation, Abdominal distinction / bloating, passing GAS, Restlessness, Injury, Breathlessness, Wheezing, Shortness of breath, Pain/Tightness of chest, Hemoptysis, Hoarseness, Naval congestion/Stuffy nose, Runny nose, Recurrent Diarrhea.'
    },
    {
      label: 'Patient denies',
      text: 'Vomiting, Diarrhea, Fever, Belching/Burping, Blood in stool, change in frequency of urination, Color change in urine, Hiccups, Vaginal discharge(describe), Burning felling in a throat at night/early in the morning, Post nasal drip, Recent severe stress.'
    }
  ];

  patientHistory: DetailRow[] = [
    { label: 'Pregnancy status', value: '24 Weeks/Normal' },
    { label: 'Medical history', value: 'Diabetes - 20 May 2021 | Current medication - Not taking any | Last measured blood sugar and HbAIC - Not known' },
    { label: 'Drug history', value: 'No recent medication' },
    { label: 'Allergies', value: 'No known allergies' },
    { label: 'Chewing tobacco status', value: 'Do not chew/Denied answer' },
    { label: 'Smoking history', value: 'Patient denied/Has no h/o smoking' },
    { label: 'Alcohol use', value: 'No/Denied' }
  ];

  familyHistory: DetailRow[] = [
    { label: 'Heart disease', value: 'Father' }
  ];

  vitals: VitalCell[] = [
    { label: 'Height(cm)', value: '163' },
    { label: 'Weight (kg)', value: '58' },
    { label: 'BMI', value: '22.10' },
    { label: 'BP Systolic', value: '200' },
    { label: 'BP Diastolic', value: '90' },
    { label: 'Pulse (bpm)', value: '102' },
    { label: 'Temperature (F)', value: '36.7' },
    { label: 'SpO2 (%)', value: '93' },
    { label: 'Respiratory Rate', value: '20' },
    { label: 'Blood Group', value: 'B POSITIVE' }
  ];

  generalExams: DetailRow[] = [
    { label: 'In', value: 'Person Consultation' },
    { label: 'Eyes', value: 'Jaundice - no Jaundice seen' },
    { label: 'Eyes', value: 'Pallor - Normal pallor' },
    { label: 'Arm', value: 'Pinch skin* - appeared slow on pinch test' },
    { label: 'Nail abnormality', value: 'Clubbing' },
    { label: 'Nail anemia', value: 'Nails are normal' },
    { label: 'Ankle', value: 'Pedal oedema in left foot' }
  ];

  eyeImages = ['assets/images/eye-1.jpg', 'assets/images/eye-2.jpg', 'assets/images/eye-3.jpg'];

  abdomenFindings: string[] = [
    'Distension seen',
    'No scarring',
    'Tenderness seen - Location - Upper(R)',
    'No lumps'
  ];

  documents: DocItem[] = [
    { type: 'image', src: 'assets/images/eye-1.jpg' },
    { type: 'image', src: 'assets/images/eye-2.jpg' },
    { type: 'pdf', name: 'Blood test report.pdf' }
  ];

  // Refer to specialist
  referToSpecialist = true;
  specializations = ['Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Gynecologist'];
  selectedSpecialization = 'Cardiologist';

  /** Disclaimer shown when the doctor keeps the visit (No referral). */
  chwNote = 'This history note and physical exam note was generated by a community health worker with the support of the Intelehealth mobile application and Ayu, a digital assistant. It collects only preliminary findings and may not gather all of the patient\'s clinical information, especially sensitive information or complex physical exam information which is hard for the health worker to collect. Please verify crucial clinical information and collect any additional information you require by speaking with the patient directly.';

  // ====================== DOCTOR'S NOTE ======================

  /** Doctor's Note sidebar group (purple icons). */
  doctorNoteNav: SectionNavItem[] = [
    { key: 'dn-interaction', label: 'Patient interaction', icon: 'assets/svgs/patient-interaction.svg' },
    { key: 'dn-diagnosis', label: 'Diagnosis', icon: 'assets/svgs/diagnosis.svg' },
    { key: 'dn-note', label: 'Note', icon: 'assets/svgs/note.svg' },
    { key: 'dn-medication', label: 'Medication', icon: 'assets/svgs/medication.svg' },
    { key: 'dn-advice', label: 'Advice', icon: 'assets/svgs/advice.svg' },
    { key: 'dn-test', label: 'Test', icon: 'assets/svgs/test.svg' },
    { key: 'dn-referral', label: 'Referral-Out', icon: 'assets/svgs/referal.svg' },
    { key: 'dn-followup', label: 'Follow-up', icon: 'assets/svgs/follow-up.svg' },
    { key: 'dn-documents', label: 'Additional documents', icon: 'assets/svgs/additional-document-purple.svg' }
  ];

  // Patient interaction
  connectedWithPatient = false;
  spokenToPatient = true;

  // Diagnosis
  hasEnoughInfo = true;
  diagnosisList = ['Viral Flu', 'Common Cold', 'Hypertension', 'Type 2 Diabetes', 'Migraine'];
  newDiagnosisName = 'Viral Flu';
  newDiagnosisType = 'Primary';
  newDiagnosisStatus = 'Provisional';
  addedDiagnoses = [
    { name: 'Viral Flu', type: 'Primary', status: 'Provisional' }
  ];

  // Note / Outcome
  noteSharedWithPatient = true;
  newNoteText = '';
  outcomeNotes: string[] = ['Let the patient know that they cannot travel for atleast 2 weeks'];

  // Medication
  timingOptions = ['Morning', 'Afternoon', 'Evening', 'Night', 'After meal', 'Before meal'];
  newMedicine = { drug: '', strength: '', timing: '', remarks: '', days: '' };
  addedMedicines = [
    { drug: 'Tab. Ecosprin AV', strength: '75 MG', days: '7', timing: '1 - 0 - 1', remarks: 'After meal' },
    { drug: 'Foracort', strength: '500 MG', days: '14', timing: '1 - 0 - 1', remarks: 'Half after meal' }
  ];
  medInstructionText = '';
  medInstructions: string[] = ['Let the patient know that they cannot travel for atleast 2 weeks'];

  // Advice
  newAdviceText = '';

  // Test
  newTestText = '';

  // Referral-Out
  referralPriorities = ['Elective', 'Urgent', 'Emergency'];
  newReferral = { speciality: '', facility: '', priority: '', reason: '' };

  // Follow-up
  wantFollowUp = true;
  followUpDate = '';
  followUpTime = '';
  followUpReason = '';

  // Additional documents (Doctor's Note)
  uploadedDocs = [
    { name: 'Cleaning Receipt.pdf' }
  ];

  // ====================== PAST VISITS ======================

  /** Top tabs when in Past Visits mode. */
  pastTopTabs = ['Past visits', 'Prescription'];
  activePastTab = 'Past visits';

  /** Timeline shown in the sidebar in Past Visits mode.
      Each visit carries its own data so selecting one swaps the content. */
  activePastVisitKey = 'pv-0';
  pastVisitsTimeline: { date: string; current?: boolean; visits: PastVisit[] }[] = [
    {
      date: 'Dec 03, 2023',
      current: true,
      visits: [{
        key: 'pv-0',
        title: 'Hypertension',
        med: 'Amlodipine 5 mg',
        by: 'Reff. to Dr. Ramirez',
        referred: true,
        diagnosis: 'Hypertension',
        consultation: [
          { label: 'Visit ID', value: 'INT-5678' },
          { label: 'Appointment ID', value: 'A-Aug-2023' },
          { label: 'Time', value: '10:30 AM' },
          { label: 'Visit started', value: '6 Aug 2023' },
          { label: 'Status', value: '10:30 AM' },
          { label: 'Age at visit', value: '45 years' }
        ],
        chiefComplaints: ['Abdominal pain', 'Back pain'],
        prescription: {
          doctor: { name: 'Dr. Rohini Yadhav (F, 35)', qualifications: 'MBBS, MD', speciality: 'General Physician' },
          diagnosis: [{ name: 'Hypertension', type: 'Primary', status: 'Confirmed' }],
          notes: ['Monitor blood pressure daily and reduce salt intake'],
          meds: [{ drug: 'Tab. Amlodipine', strength: '5 MG', days: '30', timing: '1 - 0 - 0', remarks: 'After meal' }],
          instructions: ['Avoid strenuous activity for 1 week'],
          advice: ['Reduce salt intake and exercise regularly'],
          tests: ['Lipid profile', 'ECG'],
          referral: { to: 'CHC', facility: 'HSC', priority: 'Elective', reason: 'Cardiac evaluation' },
          followUp: { suggested: 'Yes', date: 'Aug 20, 2023', time: '10:30 AM', reason: 'BP review' },
          docs: [{ name: 'BP chart.pdf' }]
        }
      }]
    },
    {
      date: 'Nov 18, 2023',
      visits: [{
        key: 'pv-1',
        title: 'Type 2 Diabetes',
        med: 'Metformin 500 mg',
        by: 'Seen by Dr. Ramirez',
        referred: false,
        diagnosis: 'Type 2 Diabetes',
        consultation: [
          { label: 'Visit ID', value: 'INT-5123' },
          { label: 'Appointment ID', value: 'A-Nov-2023' },
          { label: 'Time', value: '2:15 PM' },
          { label: 'Visit started', value: '18 Nov 2023' },
          { label: 'Status', value: '2:15 PM' },
          { label: 'Age at visit', value: '45 years' }
        ],
        chiefComplaints: ['Increased thirst', 'Frequent urination'],
        prescription: {
          doctor: { name: 'Dr. Rohini Yadhav (F, 35)', qualifications: 'MBBS, MD', speciality: 'General Physician' },
          diagnosis: [{ name: 'Type 2 Diabetes Mellitus', type: 'Primary', status: 'Confirmed' }],
          notes: ['Maintain a low-sugar diet and check fasting glucose weekly'],
          meds: [{ drug: 'Tab. Metformin', strength: '500 MG', days: '30', timing: '1 - 0 - 1', remarks: 'After meal' }],
          instructions: ['Check blood sugar before breakfast'],
          advice: ['Follow a diabetic diet and walk 30 minutes daily'],
          tests: ['HbA1c', 'Fasting blood sugar'],
          referral: { to: 'District Hospital', facility: 'HSC', priority: 'Urgent', reason: 'Endocrinology referral' },
          followUp: { suggested: 'Yes', date: 'Nov 18, 2023', time: '2:15 PM', reason: 'Sugar review' },
          docs: [{ name: 'Sugar report.pdf' }]
        }
      }]
    },
    {
      date: 'Oct 29, 2023',
      visits: [{
        key: 'pv-2',
        title: 'Hyperlipidemia',
        med: 'Atorvastatin 20 mg',
        by: 'Seen by Dr. Ramirez',
        referred: false,
        diagnosis: 'Hyperlipidemia',
        consultation: [
          { label: 'Visit ID', value: 'INT-4987' },
          { label: 'Appointment ID', value: 'A-Oct-2023' },
          { label: 'Time', value: '11:00 AM' },
          { label: 'Visit started', value: '29 Oct 2023' },
          { label: 'Status', value: '11:00 AM' },
          { label: 'Age at visit', value: '45 years' }
        ],
        chiefComplaints: ['Fatigue', 'Headache'],
        prescription: {
          doctor: { name: 'Dr. Rohini Yadhav (F, 35)', qualifications: 'MBBS, MD', speciality: 'General Physician' },
          diagnosis: [{ name: 'Hyperlipidemia', type: 'Primary', status: 'Provisional' }],
          notes: ['Start statin therapy and re-check lipids in 6 weeks'],
          meds: [{ drug: 'Tab. Atorvastatin', strength: '20 MG', days: '30', timing: '0 - 0 - 1', remarks: 'After meal' }],
          instructions: ['Take the medicine at night'],
          advice: ['Low-fat diet, avoid fried food'],
          tests: ['Lipid profile'],
          referral: { to: 'CHC', facility: 'HSC', priority: 'Elective', reason: 'Dietitian consult' },
          followUp: { suggested: 'Yes', date: 'Oct 29, 2023', time: '11:00 AM', reason: 'Lipid review' },
          docs: [{ name: 'Lipid report.pdf' }]
        }
      }]
    }
  ];

  /** Currently selected past visit (drives the past-visit content). */
  get activePastVisit(): PastVisit {
    for (const group of this.pastVisitsTimeline) {
      const found = group.visits.find(v => v.key === this.activePastVisitKey);
      if (found) { return found; }
    }
    return this.pastVisitsTimeline[0].visits[0];
  }

  // Prescription content is now per past visit — see each visit's `prescription`
  // object in pastVisitsTimeline, surfaced via the activePastVisit getter.

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.visitId = this.route.snapshot.paramMap.get('id');
  }

  setTopTab(tab: string): void {
    this.activeTopTab = tab;
    const id = tab === "Doctor's Note" ? 'section-doctor-note' : 'section-consultation';
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  setVisitScope(tab: string): void {
    this.activeVisitScope = tab;
  }

  setPastTab(tab: string): void {
    this.activePastTab = tab;
    const id = tab === 'Prescription' ? 'section-prescription' : 'section-past-visit';
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  selectPastVisit(key: string): void {
    this.activePastVisitKey = key;
    // In the real implementation this would load the selected past visit's data.
  }

  selectSection(key: string): void {
    this.activeSection = key;
    const el = document.getElementById('section-' + key);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
