import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { PatientIdentifierModel, PersonAttributeModel } from 'src/app/model/model';
import { AbdmHiType } from '../abdm.constants';
import { AbdmCareContextData, AbdmCareContextSection } from '../abdm.models';

/**
 * ABDM care-context popup: previews visit data grouped by HI type and lets the doctor
 * tick which HI types to push to ABDM. Closes with { selectedTabs: string[] } on "Send Data",
 * or with nothing when the doctor closes it.
 */
@Component({
  selector: 'app-visit-care-context',
  templateUrl: './visit-care-context.component.html',
  styleUrls: ['./visit-care-context.component.scss']
})
export class VisitCareContextComponent {

  baseURL: string = environment.baseURL;
  selectedTabIndex = 0;

  /** Tabs in display order; `selected` is bound to the tab checkbox. */
  tabs: { hiType: AbdmHiType; sections: AbdmCareContextSection[]; selected: boolean }[] = [
    { hiType: AbdmHiType.OP_CONSULT_RECORD, sections: [], selected: false },
    { hiType: AbdmHiType.WELLNESS_RECORD, sections: [], selected: false },
    { hiType: AbdmHiType.PRESCRIPTION_RECORD, sections: [], selected: false },
    { hiType: AbdmHiType.HEALTH_DOCUMENT, sections: [], selected: false },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AbdmCareContextData,
    private dialogRef: MatDialogRef<VisitCareContextComponent>,
    private translateService: TranslateService
  ) {
    this.mapData(data);
  }

  get selectedTabs(): string[] {
    return this.tabs.filter((t) => t.selected).map((t) => t.hiType);
  }

  /**
   * Close the popup returning the selected HI types
   * @return {void}
   */
  sendData(): void {
    if (!this.selectedTabs.length) return;
    this.dialogRef.close({ selectedTabs: this.selectedTabs });
  }

  /**
   * Close the popup without selecting (caller aborts the share)
   * @return {void}
   */
  close(): void {
    this.dialogRef.close();
  }

  /**
   * Group visit data into HI-type tabs
   * @param {AbdmCareContextData} data - Visit data
   * @return {void}
   */
  private mapData(data: AbdmCareContextData): void {
    const op = this.sectionsOf(AbdmHiType.OP_CONSULT_RECORD);
    const wellness = this.sectionsOf(AbdmHiType.WELLNESS_RECORD);
    const prescription = this.sectionsOf(AbdmHiType.PRESCRIPTION_RECORD);
    const healthDocument = this.sectionsOf(AbdmHiType.HEALTH_DOCUMENT);
    const push = (target: AbdmCareContextSection[], type: string, entries: { key: string; value: any }[]) => {
      if (entries?.length) target.push({ type, entries });
    };

    if (data?.provider?.person?.display) {
      push(op, 'Provider (Practitioner)', [{ key: 'Name', value: data.provider.person.display }]);
    }
    if (data?.visit?.startDatetime) {
      push(op, 'Visit (Encounter)', [{ key: 'Start DateTime', value: moment(data.visit.startDatetime).format('DD MMM YYYY, hh:mm A') }]);
    }
    if (data?.cheifComplaints?.length) {
      push(op, 'Cheif Complaints (Condition)', [{ key: 'Cheif Complaints', value: data.cheifComplaints.join(', ') }]);
    }
    if (data?.physicalExaminations?.length) {
      const entries = [];
      data.physicalExaminations.forEach((pe: any) => (pe?.data ?? []).forEach((p: any) => {
        entries.push({ key: `${pe.title} ${p.key ?? p.name ?? ''}`.trim(), value: this.displayValue(p.value) });
      }));
      push(op, 'Physical Examinations (Observation)', entries);
    }
    push(op, 'Diagnoses (Condition)', (data?.diagnosis ?? []).map((d: any) => ({
      key: 'Diagnosis',
      value: d?.diagnosisName ? [d.diagnosisName, d.diagnosisType, d.diagnosisStatus].filter(Boolean).join(' - ') : this.objectValues(d)
    })));
    push(op, 'Advices (Observation)', (data?.advices ?? []).map((a: any) => ({ key: 'Advice', value: a?.value })));
    push(op, 'Tests (Observation)', (data?.tests ?? []).map((t: any) => ({ key: 'Test', value: t?.value })));
    if (data?.followUp?.followUpDate || (data?.followUp?.wantFollowUp && data.followUp.wantFollowUp !== 'No')) {
      push(op, 'Follow Up (Appointment)', [{
        key: 'Follow Up',
        value: [data.followUp.followUpDate ? moment(data.followUp.followUpDate).format('DD MMM YYYY') : data.followUp.wantFollowUp, data.followUp.followUpTime, data.followUp.followUpReason]
          .filter(Boolean).join(' ')
      }]);
    }

    push(wellness, 'Vitals (Observation)', (data?.vitals ?? []).map((v: any) => ({
      key: this.displayValue(v?.concept) || 'Vital',
      value: this.displayValue(v?.value)
    })));
    const history = [];
    (data?.patientHistoryData ?? []).forEach((ph: any) => {
      if (ph?.title !== 'Patient history') return;
      (ph.data ?? []).forEach((p: any) => history.push({ key: p.key, value: this.displayValue(p.value) }));
    });
    push(wellness, 'Patient History (Observation)', history);

    push(prescription, 'Medicines (MedicationRequest)', (data?.medicines ?? []).map((m: any) => ({
      key: 'Medicine',
      value: this.medicineDisplay(m)
    })));

    push(healthDocument, 'Doctor Uploaded Documents (DocumentReference)', (data?.doctorUploadedDocs ?? []).map((doc) => ({
      key: doc.fileName,
      value: ''
    })));
  }

  private sectionsOf(hiType: AbdmHiType): AbdmCareContextSection[] {
    return this.tabs.find((t) => t.hiType === hiType).sections;
  }

  private medicineDisplay(m: any): string {
    if (!m) return '';
    if (m.drug && (m.dose !== undefined || m.durationNo !== undefined)) {
      // Standard (AI/structured) medicine
      return [m.drug, m.dose, m.frequency, m.durationNo && `${m.durationNo} ${m.durationUnit ?? ''}`.trim(), m.instructRemark]
        .filter((v) => v && v !== '-').join(' ');
    }
    if (m.drug) {
      return [m.drug, m.strength, m.days, m.timing, m.frequency, m.remark].filter((v) => v && v !== '-').join(' ');
    }
    return this.objectValues(m);
  }

  private displayValue(value: any): string {
    if (value === null || value === undefined) return null;
    return typeof value === 'object' ? value?.display : value;
  }

  private objectValues(obj: any): string {
    return Object.entries(obj ?? {})
      .filter(([key, value]) => key !== 'uuid' && (typeof value === 'string' || typeof value === 'number'))
      .map(([, value]) => value)
      .join(' ');
  }

  /**
   * Get patient identifier for given identifier type
   * @param {string} identifierType - Identifier type
   * @return {string} - Patient identifier value
   */
  getPatientIdentifier(identifierType: string): string {
    return this.data?.patient?.identifiers
      ?.find((idf: PatientIdentifierModel) => idf.identifierType?.display === identifierType)?.identifier ?? '';
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
    }
    return `${days} ${this.translateService.instant('days')}`;
  }

  /**
   * Get person attribute value for a given attribute type
   * @param {string} attrType - Person attribute type
   * @return {any} - Value for a given attribute type
   */
  getPersonAttributeValue(attrType: string): any {
    return this.data?.patient?.person?.attributes
      ?.find((attr: PersonAttributeModel) => attr.attributeType?.display === attrType)?.value
      ?? this.translateService.instant('NA');
  }
}
