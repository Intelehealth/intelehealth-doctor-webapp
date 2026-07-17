export interface SectionNavItem {
  key: string;
  label: string;
  icon: string;
}

export interface DetailRow {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface ComplaintDetail {
  title: string;
  rows: DetailRow[];
}

export interface SymptomGroup {
  label: string;
  text: string;
}

export interface VitalCell {
  label: string;
  value: string;
}

export interface DocItem {
  type: 'image' | 'pdf';
  name?: string;
  src?: string;
}

export interface PrescriptionData {
  doctor: { name: string; qualifications: string; speciality: string };
  diagnosis: { name: string; type: string; status: string }[];
  notes: string[];
  meds: { drug: string; dose: string; durationNo: string; durationUnit: string; instructRemark: string; frequency: string }[];
  instructions: string[];
  advice: string[];
  tests: string[];
  referral: { to: string; facility: string; priority: string; reason: string };
  followUp: { suggested: string; date: string; time: string; reason: string };
  docs: { name: string }[];
}

export interface PastVisit {
  key: string;
  title: string;
  med: string;
  by: string;
  referred: boolean;
  diagnosis: string;
  consultation: DetailRow[];
  chiefComplaints: string[];
  prescription: PrescriptionData;
  complaintDetails: ComplaintDetail[];
  associatedSymptoms: SymptomGroup[];
  patientHistory: DetailRow[];
  familyHistory: DetailRow[];
  vitals: VitalCell[];
  generalExams: DetailRow[];
  abdomenFindings: string[];
  eyeImages: string[];
  documents: DocItem[];
}

export interface TimelineGroup {
  date: string;
  current?: boolean;
  visits: PastVisit[];
}

export interface AllergyItem {
  name: string;
  severe: boolean;
}

export interface PatientContact {
  no: string;
  type: 'whatsapp' | 'call';
}

export interface Patient {
  name: string;
  gender: string;
  tag: string;
  openMrsId: string;
  avatar: string;
  age: string;
  weight: string;
  allergies: string[];
  extraAllergiesCount: number;
  pregnancy: string;
  contactNo: string;
  occupation: string;
  dateOfBirth: string;
  allAllergies: AllergyItem[];
  contacts: PatientContact[];
  address: DetailRow[];
  other: DetailRow[];
}
