import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import { environment } from 'src/environments/environment';

export interface ShrHistoryFilters {
  fromDate?: string;
  toDate?: string;
  recordTypes?: string[];
  status?: string;
  snomedCode?: string;
  sort?: 'newest' | 'oldest';
  limit?: number;
}

export interface ShrHistoryPatient {
  openmrsPatientUuid: string;
  openmrsPatientDisplay: string;
  cruid: string;
  shrPatientFound: boolean;
  shrPatientId: string;
  shrPatientDisplay?: string;
}

export interface ShrHistoryItem {
  id: string;
  date: string;
  facility: string;
  doctor: string;
  doctorSpecialization?: string;
  doctorQualification?: string;
  status?: string;
  recordType: string;
  recordTypes: string[];
  visitType?: string;
  source?: string;
  diagnoses: ShrHistoryDiagnosis[];
  medications: ShrHistoryMedication[];
  observations: ShrHistoryObservation[];
  vitals: ShrHistoryObservation[];
  labs: ShrHistoryObservation[];
  serviceRequests: ShrHistoryServiceRequest[];
  familyHistory: ShrFamilyHistoryItem[];
  documents: ShrHistoryDocument[];
  provenance: ShrHistoryProvenance[];
  isFamilyHistoryVisit?: boolean;
}

export interface ShrHistoryDiagnosis {
  name: string;
  clinicalStatus?: string;
  verificationStatus?: string;
  asserter?: string;
  note?: string;
  rank?: number;
}

export interface ShrFamilyHistoryItem {
  label: string;
  relationship?: string;
  conditions: string[];
  note?: string;
  status?: string;
}

export interface ShrHistoryMedication {
  name: string;
  dosage?: string;
  status?: string;
  requester?: string;
}

export interface ShrHistoryObservation {
  name: string;
  value?: string;
  status?: string;
  requester?: string;
  abnormal?: boolean;
}

export interface ShrHistoryServiceRequest extends ShrHistoryObservation {
  category?: string;
  priority?: string;
}

export interface ShrHistoryDocument {
  title: string;
  contentType?: string;
  url?: string;
  size?: number;
  creation?: string;
  isImage?: boolean;
}

export interface ShrHistoryProvenance {
  author?: string;
  organization?: string;
  activity?: string;
  recorded?: string;
}

export interface ShrHistoryResponse {
  count: number;
  next: string;
  previous: string;
  results: ShrHistoryItem[];
  patient: ShrHistoryPatient;
  warnings: string[];
}

export interface ShrConcept {
  uuid: string;
  display: string;
  code: string;
}

interface ShrApiTimelineItem {
  encounterId: string;
  visitDateTime: string;
  facility?: { name?: string; reference?: string };
  clinician?: { name?: string; specialization?: string; qualification?: string; uuid?: string; signatureUrl?: string };
  diagnoses?: any[];
  prescriptions?: any[];
  vitals?: any[];
  labs?: any[];
  familyHistory?: any[];
  documents?: any[];
  doctorDetails?: any;
  familyHistoryVisit?: boolean;
}

interface ShrApiResponse {
  patient: ShrHistoryPatient;
  pagination?: { total?: number; links?: { self?: string; next?: string; prev?: string } };
  timeline?: ShrApiTimelineItem[];
  bundle?: { entry?: Array<{ resource?: any }> };
  warnings?: string[];
  meta?: any;
  queries?: any[];
}

@Injectable({ providedIn: 'root' })
export class ShrHistoryService {
  private readonly baseURL = environment.baseURL;
  private readonly historyEndpoint = `${this.baseURL}/ihshr/shr/history`;
  private readonly conceptEndpoint = `${this.baseURL}/concept`;

  constructor(private http: HttpClient) { }

  getHistory(patientUuid: string, filters: ShrHistoryFilters = {}, pageUrl?: string): Observable<ShrHistoryResponse> {
    if (!patientUuid) {
      return of(this.emptyResponse());
    }

    const limit = Number(filters.limit) || 50;
    let params = new HttpParams()
      .set('view', 'custom')
      .set('format', 'timeline')
      .set('count', String(limit));

    if (filters.recordTypes?.length) {
      params = params.set('recordTypes', filters.recordTypes.join(','));
    }
    if (filters.fromDate) {
      params = params.set('fromDate', filters.fromDate);
    }
    if (filters.toDate) {
      params = params.set('toDate', filters.toDate);
    }
    if (filters.status && filters.status !== 'all') {
      params = params.set('status', filters.status);
    }
    if (filters.snomedCode) {
      params = params.set('snomedCode', filters.snomedCode);
    }
    if (filters.sort === 'oldest') {
      params = params.set('sort', 'oldest');
    }

    return this.http.get<ShrApiResponse>(`${this.historyEndpoint}/${encodeURIComponent(patientUuid)}`, { params }).pipe(
      map(response => this.mapResponse(response, filters, this.getPageNumber(pageUrl)))
    );
  }

  searchConcepts(term: string): Observable<ShrConcept[]> {
    if (!term) {
      return of([]);
    }

    const params = new HttpParams()
      .set('q', term)
      .set('v', 'custom:(uuid,display,mappings:(display))');

    return this.http.get<any>(this.conceptEndpoint, { params }).pipe(
      map(response => (response?.results || []).map(concept => ({
        uuid: concept.uuid,
        display: concept.display,
        code: this.getConceptCode(concept)
      })))
    );
  }

  downloadPdf(patient: ShrHistoryPatient, records: ShrHistoryItem[]): void {
    const document = new jsPDF();
    let y = 18;
    const addLine = (text: string, indent = 0) => {
      const lines = document.splitTextToSize(text || '', 180 - indent);
      if (y + (lines.length * 6) > 282) {
        document.addPage();
        y = 18;
      }
      document.text(lines, 15 + indent, y);
      y += lines.length * 6;
    };

    document.setFontSize(16);
    addLine('SHR Clinical History');
    document.setFontSize(10);
    addLine(`Patient: ${patient?.openmrsPatientDisplay || patient?.shrPatientDisplay || 'Not available'}`);
    addLine(`CRUID: ${patient?.cruid || 'Not available'}`);
    addLine(`SHR Patient ID: ${patient?.shrPatientId || 'Not available'}`);
    addLine(`Records exported: ${records.length}`);
    y += 4;

    records.forEach(record => {
      document.setFont('helvetica', 'bold');
      addLine(`${this.formatPdfDate(record.date)} | ${record.facility}`);
      document.setFont('helvetica', 'normal');
      addLine(`Clinician: ${record.doctor}`, 3);
      if (record.source) { addLine(`Source: ${record.source}`, 3); }
      record.diagnoses.forEach(value => addLine(`Diagnosis: ${value.name}${value.verificationStatus ? ` (${value.verificationStatus})` : ''}`, 3));
      record.medications.forEach(value => addLine(`Medication: ${value.name}${value.dosage ? ` — ${value.dosage}` : ''}${value.status ? ` (${value.status})` : ''}`, 3));
      record.vitals.forEach(value => addLine(`Vital: ${value.name}${value.value ? ` - ${value.value}` : ''}`, 3));
      record.observations.forEach(value => addLine(`Observation: ${value.name}${value.value ? ` - ${value.value}` : ''}`, 3));
      record.labs.forEach(value => {
        addLine(`Lab result: ${value.name}${value.value ? ` - ${value.value}` : ''}${value.status ? ` (${value.status})` : ''}`, 3);
      });
      record.serviceRequests.forEach(value => {
        addLine(`Order/referral: ${value.name}${value.status ? ` (${value.status})` : ''}`, 3);
        if (value.requester) { addLine(`Requested by: ${value.requester}`, 6); }
      });
      record.familyHistory.forEach(item => {
        const conditions = item.conditions?.length ? item.conditions.join(', ') : (item.label || 'Unknown');
        addLine(`Family history (${item.relationship || item.label}): ${conditions}`, 3);
        if (item.note) { addLine(`  Note: ${item.note}`, 6); }
      });
      record.documents.forEach(value => addLine(`Document: ${value.title}${value.contentType ? ` (${value.contentType})` : ''}`, 3));
      y += 4;
    });

    document.save(`shr-history-${patient?.openmrsPatientUuid || 'patient'}.pdf`);
  }

  getDefaultFilters(): ShrHistoryFilters {
    return {
      fromDate: null,
      toDate: null,
      recordTypes: [],
      status: 'all',
      sort: 'newest',
      limit: 10
    };
  }

  private mapResponse(response: ShrApiResponse, filters: ShrHistoryFilters, page: number): ShrHistoryResponse {
    let records = response?.timeline
      ? response.timeline.map(item => this.mapTimelineItem(item))
      : this.mapBundle(response?.bundle);

    if (filters.fromDate) {
      records = records.filter(record => record.date?.slice(0, 10) >= filters.fromDate);
    }
    if (filters.toDate) {
      records = records.filter(record => record.date?.slice(0, 10) <= filters.toDate);
    }
    if (filters.recordTypes?.length) {
      records = records.filter(record => filters.recordTypes.some(type => record.recordTypes.includes(type)));
    }
    if (filters.status && filters.status !== 'all') {
      records = records.filter(record => record.status === filters.status ||
        record.diagnoses.some(value => value.clinicalStatus === filters.status || value.verificationStatus === filters.status) ||
        record.medications.some(value => value.status === filters.status) ||
        [...record.vitals, ...record.observations, ...record.labs, ...record.serviceRequests]
          .some(value => value.status === filters.status));
    }
    if (filters.snomedCode) {
      const code = filters.snomedCode.toLowerCase();
      records = records.filter(record => record.diagnoses.some(value => value.name.toLowerCase().includes(code)));
    }

    records.sort((a, b) => {
      const difference = new Date(a.date).getTime() - new Date(b.date).getTime();
      return filters.sort === 'oldest' ? difference : -difference;
    });

    const count = records.length;
    const limit = Number(filters.limit) || 10;
    const start = (page - 1) * limit;

    return {
      count,
      next: start + limit < count ? `?page=${page + 1}` : null,
      previous: page > 1 ? `?page=${page - 1}` : null,
      results: records.slice(start, start + limit),
      patient: response?.patient,
      warnings: response?.warnings || []
    };
  }

  private mapTimelineItem(item: ShrApiTimelineItem): ShrHistoryItem {
    const documents = (item.documents || [])
      .map(value => this.toDocument(value));
    const clinicalLabs = (item.labs || []).filter(lab => !this.isDoctorDetails(lab.label || lab.name || lab.text));
    const labs = clinicalLabs.filter(lab => lab.kind !== 'order' && lab.resourceType !== 'ServiceRequest').map(lab => ({
      name: lab.label || lab.text || 'Lab/test order',
      value: lab.value || lab.result,
      status: lab.status,
      requester: lab.requester,
      abnormal: lab.abnormal
    }));
    const serviceRequests = clinicalLabs.filter(lab => lab.kind === 'order' || lab.resourceType === 'ServiceRequest').map(lab => ({
      name: lab.label || lab.text || 'Order or referral',
      value: lab.value || lab.result,
      status: lab.status,
      requester: lab.requester
    }));
    const recordTypes = ['Encounter'];
    if ((item.diagnoses || []).length) {
      recordTypes.push('Condition');
    }
    if ((item.prescriptions || []).length) {
      recordTypes.push('MedicationRequest');
    }
    if ((item.vitals || []).some(value => !this.isDoctorDetails(value?.label || value?.name || value?.text)) ||
      clinicalLabs.some(lab => lab.kind !== 'order' && lab.resourceType !== 'ServiceRequest')) {
      recordTypes.push('Observation');
    }
    if (documents.length) {
      recordTypes.push('DocumentReference');
    }
    if ((item.familyHistory || []).length) {
      recordTypes.push('FamilyMemberHistory');
    }
    if ((item.labs || []).some(lab => lab.resourceType === 'ServiceRequest' || lab.kind === 'order')) {
      recordTypes.push('ServiceRequest');
    }

    return {
      id: item.encounterId,
      date: item.visitDateTime,
      facility: item.facility?.name || 'Facility not available',
      doctor: item.clinician?.name || 'Clinician not available',
      doctorSpecialization: item.clinician?.specialization || item.doctorDetails?.specialization,
      doctorQualification: item.clinician?.qualification || item.doctorDetails?.qualification,
      status: this.firstValue(item, 'status'),
      recordType: 'Encounter',
      recordTypes,
      visitType: this.firstValue(item, 'visitType'),
      source: null,
      diagnoses: (item.diagnoses || []).map(value => this.toDiagnosis(value)),
      medications: (item.prescriptions || []).map(value => this.toMedication(value)),
      observations: [],
      vitals: (item.vitals || [])
        .filter(value => !this.isDoctorDetails(value?.label || value?.name || value?.text))
        .map(value => this.toObservation(value)),
      labs,
      serviceRequests,
      familyHistory: (item.familyHistory || []).map(value => this.toFamilyHistoryItem(value)),
      documents,
      provenance: [],
      isFamilyHistoryVisit: !!item.familyHistoryVisit
    };
  }

  private mapBundle(bundle: { entry?: Array<{ resource?: any }> }): ShrHistoryItem[] {
    const resources = (bundle?.entry || []).map(entry => entry.resource).filter(Boolean);
    const encounters = resources.filter(resource => resource.resourceType === 'Encounter');
    const records = new Map<string, ShrHistoryItem>();

    encounters.forEach(encounter => {
      const participant = encounter.participant?.find(value => value?.individual?.display)?.individual;
      const origin = encounter.meta?.tag?.find(value => value?.system === 'https://intelehealth.org/origin');
      records.set(encounter.id, {
        id: encounter.id,
        date: encounter.period?.start || encounter.meta?.lastUpdated,
        facility: encounter.location?.[0]?.location?.display || origin?.code || 'Facility not available',
        doctor: participant?.display || 'Clinician not available',
        status: encounter.status && encounter.status !== 'unknown' ? encounter.status : null,
        recordType: 'Encounter',
        recordTypes: ['Encounter'],
        visitType: encounter.type?.[0]?.coding?.[0]?.display,
        source: origin?.code || origin?.display,
        diagnoses: [],
        medications: [],
        observations: [],
        vitals: [],
        labs: [],
        serviceRequests: [],
        familyHistory: [],
        documents: [],
        provenance: []
      });
    });

    resources.filter(resource => resource.resourceType !== 'Encounter').forEach(resource => {
      const encounterId = this.getResourceEncounterId(resource);
      const record = records.get(encounterId);
      if (!record) { return; }

      switch (resource.resourceType) {
        case 'Condition':
          record.diagnoses.push({
            name: this.getCodeDisplay(resource.code),
            clinicalStatus: this.getCodingCode(resource.clinicalStatus),
            verificationStatus: this.getCodingCode(resource.verificationStatus),
            asserter: resource.asserter?.display
          });
          this.addRecordType(record, 'Condition');
          break;
        case 'MedicationRequest':
          record.medications.push({
            name: resource.medicationReference?.display || this.getCodeDisplay(resource.medicationCodeableConcept),
            dosage: this.formatDosage(resource.dosageInstruction?.[0]?.text),
            status: resource.status,
            requester: resource.requester?.display
          });
          this.addRecordType(record, 'MedicationRequest');
          break;
        case 'Observation': {
          if (this.isDoctorDetails(this.getCodeDisplay(resource.code))) { break; }
          const observation = this.toFhirObservation(resource);
          const category = this.getObservationCategory(resource);
          if (category === 'vital-signs') {
            record.vitals.push(observation);
          } else if (category === 'laboratory') {
            record.labs.push(observation);
          } else {
            record.observations.push(observation);
          }
          this.addRecordType(record, 'Observation');
          break;
        }
        case 'ServiceRequest':
          record.serviceRequests.push({
            name: this.getCodeDisplay(resource.code),
            status: resource.status,
            requester: resource.requester?.display,
            category: this.getCodeDisplay(resource.category?.[0]),
            priority: resource.priority
          });
          this.addRecordType(record, 'ServiceRequest');
          break;
        case 'DocumentReference': {
          const documents = (resource.content || []).map(content => {
            const attachment = content?.attachment || {};
            const url = attachment.url;
            const contentType = attachment.contentType || '';
            const isImage = contentType.trim().toLowerCase().startsWith('image/');
            return {
              title: attachment.title || this.getCodeDisplay(resource.type),
              contentType: attachment.contentType,
              url: this.getDocumentUrl(url),
              size: attachment.size,
              creation: attachment.creation,
              isImage
            } as ShrHistoryDocument;
          });
          record.documents.push(...documents);
          if (documents.length) {
            this.addRecordType(record, 'DocumentReference');
          }
          break;
        }
        case 'FamilyMemberHistory': {
          const fhConditions = (resource.condition || []).map((c: any) => this.getCodeDisplay(c.code) || '');
          if (!fhConditions.length) {
            fhConditions.push(this.getCodeDisplay(resource.relationship));
          }
          record.familyHistory.push({
            label: this.getCodeDisplay(resource.relationship) || 'Family member',
            relationship: this.getCodeDisplay(resource.relationship),
            conditions: fhConditions,
            note: resource.note?.[0]?.text,
            status: resource.status
          });
          this.addRecordType(record, 'FamilyMemberHistory');
          break;
        }
      }
    });

    resources.filter(resource => resource.resourceType === 'Provenance').forEach(resource => {
      const encounterIds = (resource.target || []).map(target => {
        const [resourceType, resourceId] = (target.reference || '').split('/');
        if (resourceType === 'Encounter') { return resourceId; }
        const targetResource = resources.find(value => value.resourceType === resourceType && value.id === resourceId);
        return this.getResourceEncounterId(targetResource);
      }).filter(Boolean);
      const author = (resource.agent || []).find(agent => this.getCodingCode(agent.type) === 'author');
      encounterIds.forEach(encounterId => {
        const record = records.get(encounterId);
        if (!record) { return; }
        record.provenance.push({
          author: author?.who?.display,
          organization: this.getReferenceLabel(author?.onBehalfOf),
          activity: this.getCodeDisplay(resource.activity),
          recorded: resource.recorded || resource.occurredDateTime
        });
      });
    });

    return Array.from(records.values());
  }

  private getResourceEncounterId(resource: any): string {
    const reference = resource?.encounter?.reference || resource?.context?.encounter?.[0]?.reference || '';
    return reference.split('/').pop();
  }

  private addRecordType(record: ShrHistoryItem, type: string): void {
    if (!record.recordTypes.includes(type)) {
      record.recordTypes.push(type);
    }
  }

  private getCodeDisplay(code: any): string {
    return code?.text || code?.coding?.find(value => value?.display)?.display || 'Information not available';
  }

  private getCodingCode(code: any): string {
    return code?.coding?.find(value => value?.code)?.code;
  }

  private getObservationCategory(resource: any): string {
    const categories = [];
    (resource.category || []).forEach(category => {
      (category.coding || []).forEach(coding => categories.push(coding.code));
    });
    if (categories.includes('vital-signs')) { return 'vital-signs'; }
    if (categories.includes('laboratory')) { return 'laboratory'; }
    return categories[0] || 'observation';
  }

  private isDoctorDetails(value: string): boolean {
    return (value || '').trim().toLowerCase() === 'doctor details';
  }

  private isImageDocument(value: ShrHistoryDocument): boolean {
    return (value?.contentType || '').trim().toLowerCase().startsWith('image/');
  }

  private getReferenceLabel(reference: any): string {
    if (reference?.display) { return reference.display; }
    return (reference?.reference || '').split('/').pop();
  }

  private formatDosage(value: string): string {
    if (!value) { return null; }
    const parts = value.split('|').map(part => part.trim()).filter(Boolean);
    const firstIsInternalCode = parts.length > 1 && (/^[0-9]+A{8,}$/i.test(parts[0]) || /^[0-9a-f-]{16,}$/i.test(parts[0]));
    return (firstIsInternalCode ? parts.slice(1) : parts).join(' · ');
  }

  private toFhirObservation(resource: any): ShrHistoryObservation {
    return {
      name: this.getCodeDisplay(resource.code),
      value: this.getFhirValue(resource),
      status: resource.status
    };
  }

  private getFhirValue(resource: any): string {
    if (resource.valueString !== undefined) {
      const value = String(resource.valueString);
      const structuredValue = this.getStructuredClinicalText(value, resource.component);
      if (structuredValue) { return structuredValue; }
      return this.toPlainClinicalText(value);
    }
    if (resource.valueBoolean !== undefined) { return String(resource.valueBoolean); }
    if (resource.valueInteger !== undefined) { return String(resource.valueInteger); }
    if (resource.valueDateTime) { return resource.valueDateTime; }
    if (resource.valueQuantity) {
      return `${resource.valueQuantity.value ?? ''} ${resource.valueQuantity.unit || resource.valueQuantity.code || ''}`.trim();
    }
    if (resource.valueCodeableConcept) {
      return this.toClinicalCodedValue(this.getCodeDisplay(resource.valueCodeableConcept));
    }
    return (resource.component || []).map(component => {
      const name = this.getCodeDisplay(component.code);
      const value = this.getFhirValue(component);
      return value ? `${name}: ${value}` : name;
    }).join(', ');
  }

  private getStructuredClinicalText(value: string, components: any[]): string {
    const trimmedValue = (value || '').trim();
    if (!trimmedValue.startsWith('{')) { return null; }

    try {
      const parsed = JSON.parse(trimmedValue);
      if (components?.length) {
        return components.map(component => {
          const name = this.getCodeDisplay(component.code);
          const componentValue = this.getFhirValue(component);
          return componentValue ? `${name}: ${componentValue}` : name;
        }).join(' · ');
      }

      if (parsed?.en) {
        return this.toPlainClinicalText(parsed.en);
      }
    } catch (_) {
      return null;
    }

    return null;
  }

  private toPlainClinicalText(value: string): string {
    return (value || '')
      .replace(/<br\s*\/?\s*>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private toClinicalCodedValue(value: string): string {
    const normalized = (value || '').trim();
    if (/^present\s*\(qualifier value\)$/i.test(normalized)) { return 'Present'; }
    if (/^negative\s*\(qualifier value\)$/i.test(normalized)) { return 'Not present'; }
    return normalized.replace(/\s*\(qualifier value\)$/i, '');
  }

  private toObservation(value: any): ShrHistoryObservation {
    const rawValue = value?.value || value?.result;
    const unit = value?.unit;
    const displayValue = rawValue != null
      ? (unit ? `${rawValue} ${unit}` : String(rawValue))
      : undefined;
    return {
      name: value?.label || value?.name || value?.display || value?.text || 'Observation',
      value: displayValue,
      status: value?.status,
      abnormal: value?.abnormal
    };
  }

  private toDiagnosis(value: any): ShrHistoryDiagnosis {
    if (typeof value === 'string') { return { name: value }; }
    return {
      name: value?.display || value?.text || this.toDisplayText(value),
      clinicalStatus: value?.clinicalStatus || value?.status,
      verificationStatus: value?.verificationStatus,
      asserter: value?.asserter,
      note: value?.note?.text,
      rank: value?.rank
    };
  }

  private toMedication(value: any): ShrHistoryMedication {
    if (typeof value === 'string') { return { name: value }; }
    // New API shape: medication.display + strength/frequency/duration/durationUnit/unit
    const name = value?.medication?.display
      || value?.label
      || value?.display
      || value?.name
      || value?.text
      || 'Medication not available';
    let dosage: string;
    if (value?.strength || value?.frequency || value?.duration) {
      const parts: string[] = [];
      if (value.strength) { parts.push(value.strength); }
      if (value.frequency) { parts.push(value.frequency); }
      if (value.duration) {
        parts.push(`${value.duration}${value.durationUnit || ''}`
          .replace('d', ' day').replace('wk', ' week').replace('mo', ' month').trim());
      }
      if (value.unit) { parts.push(value.unit); }
      dosage = parts.join(' · ');
    } else {
      dosage = this.formatDosage(value?.dosage || value?.dosageText);
    }
    return {
      name,
      dosage,
      status: value?.status,
      requester: value?.requester
    };
  }

  private toFamilyHistoryItem(value: any): ShrFamilyHistoryItem {
    if (typeof value === 'string') {
      return { label: value, conditions: [], relationship: undefined, note: undefined, status: undefined };
    }
    const conditions = (value?.conditions || []).map((c: any) => c?.display || c?.text || '');
    // Fallback: if no conditions array, try single value field
    if (!conditions.length && value?.value) {
      conditions.push(value.value);
    }
    return {
      label: value?.label || value?.relationship?.text || 'Family member',
      relationship: value?.relationship?.text || value?.label,
      conditions,
      note: value?.note?.text,
      status: value?.status
    };
  }

  private getDocumentUrl(urlOrBinaryUrl: string): string {
    if (!urlOrBinaryUrl) { return ''; }
    if (urlOrBinaryUrl.startsWith('http://') || urlOrBinaryUrl.startsWith('https://')) {
      return urlOrBinaryUrl;
    }
    let path = urlOrBinaryUrl;
    if (path.startsWith('/')) {
      path = path.slice(1);
    }
    if (path.startsWith('ws/rest/v1/')) {
      return `${this.baseURL}/${path.slice('ws/rest/v1/'.length)}`;
    }
    return `/openmrs/${path}`;
  }

  private toDocument(value: any): ShrHistoryDocument {
    if (typeof value === 'string') { return { title: value }; }
    const url = value?.url || value?.binaryUrl;
    const contentType = value?.contentType || '';
    const isImage = contentType.trim().toLowerCase().startsWith('image/');
    return {
      title: this.toDisplayText(value),
      contentType: value?.contentType,
      url: this.getDocumentUrl(url),
      size: value?.size,
      creation: value?.creation,
      isImage
    };
  }

  private toDisplayText(value: any): string {
    if (typeof value === 'string') { return value; }
    return value?.label || value?.display || value?.name || value?.text || value?.title || 'Information not available';
  }

  private firstValue(item: any, key: string): string {
    return item && typeof item[key] === 'string' ? item[key] : null;
  }

  private getConceptCode(concept: any): string {
    const mapping = concept?.mappings?.find(value => value?.display);
    const display = mapping?.display || '';
    const separator = display.lastIndexOf(':');
    return separator >= 0 ? display.slice(separator + 1).trim() : display;
  }

  private getPageNumber(url: string): number {
    const match = (url || '').match(/[?&]page=(\d+)/);
    return match ? Number(match[1]) : 1;
  }

  private formatPdfDate(value: string): string {
    return value ? new Date(value).toLocaleString() : 'Date not available';
  }

  private emptyResponse(): ShrHistoryResponse {
    return { count: 0, next: null, previous: null, results: [], patient: null, warnings: [] };
  }
}
