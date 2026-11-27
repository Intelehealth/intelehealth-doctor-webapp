import { PatientModel, ProviderModel, VisitModel } from '../model/model';

/** Visit data shown in the ABDM care-context popup, grouped later into HI types. */
export interface AbdmCareContextData {
  visit: VisitModel;
  patient: PatientModel;
  provider?: ProviderModel;
  vitals?: any[];
  cheifComplaints?: string[];
  diagnosis?: any[];
  medicines?: any[];
  tests?: any[];
  advices?: any[];
  followUp?: any;
  physicalExaminations?: any[];
  patientHistoryData?: any[];
  doctorUploadedDocs?: { fileName?: string }[];
}

/** One block (FHIR resource) displayed inside an HI-type tab. */
export interface AbdmCareContextSection {
  type: string;
  entries: { key: string; value: any }[];
}

/** Input needed to link a completed visit to ABDM. */
export interface AbdmLinkVisitParams {
  visit: VisitModel;
  patient: PatientModel;
  encounterUuid: string;
  hiTypes: string[];
}
