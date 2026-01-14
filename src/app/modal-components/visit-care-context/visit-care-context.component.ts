import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { PatientIdentifierModel, PersonAttributeModel } from 'src/app/model/model';

@Component({
  selector: 'app-visit-care-context',
  templateUrl: './visit-care-context.component.html',
  styleUrls: ['./visit-care-context.component.scss']
})
export class VisitCareContextComponent implements OnInit {

  loading: boolean = false;
  error: string = '';
  selectedTabIndex: number = 0;
  baseURL: string = environment.baseURL;

  // Tab data
  overviewData: any = {};
  healthRecordsData: any[] = [];
  consentData: any[] = [];
  activityLogData: any[] = [];

  // Checkbox state for each tab
  tabCheckboxes: boolean[] = [false, false, false, false];
  selectedTabs: string[] = [];

  careContextData = {
    OpConsultRecord: [],
    WellnessRecord: [],
    HealthDocumentRecord: [],
    PrescriptionRecord: [],
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VisitCareContextComponent>,
    private visitService: VisitService,
    private translateService: TranslateService
  ) {
    console.log('Received data:', data);
    this.mapData(data);
  }

  ngOnInit(): void {
    
  }

  /**
   * Handle tab change event
   * @param {number} index - Selected tab index
   * @return {void}
   */
  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }

  /**
   * Handle checkbox change event
   * @param {number} index - Tab index
   * @param {string} tabName - Tab name
   * @return {void}
   */
  onCheckboxChange(index: number, tabName: string) {
    if (this.tabCheckboxes[index]) {
      // Add tab name if checkbox is checked
      if (!this.selectedTabs.includes(tabName)) {
        this.selectedTabs.push(tabName);
      }
    } else {
      // Remove tab name if checkbox is unchecked
      const tabIndex = this.selectedTabs.indexOf(tabName);
      if (tabIndex > -1) {
        this.selectedTabs.splice(tabIndex, 1);
      }
    }
  }

  /**
   * Send data for selected tabs
   * @return {void}
   */
  sendData() {
    if (this.selectedTabs.length === 0) {
      console.log('No tabs selected');
      return;
    }
    console.log('Selected tabs:', this.selectedTabs);
    // close the modal and pass selected tabs data
    this.dialogRef.close({
      selectedTabs: this.selectedTabs
    });
  }

  /**
   * Close modal
   * @return {void}
   */
  close() {
    this.dialogRef.close();
  }

  mapData(data: any) {
    // if(data.patient) {
    //   this.careContextData.OpConsultRecord.push({
    //     type: 'Patient (Patient)',
    //     entries: [{
    //       key: 'Name',
    //       value: data.patient.person.display
    //     }]
    //   });
    // }
    if(data.provider) {
      this.careContextData.OpConsultRecord.push({
        type: 'Provider (Practitioner)',
        entries: [{
          key: 'Name',
          value: data.provider.person.display
        }]
      });
    }
    if(data.visit.startDatetime) {
      this.careContextData.OpConsultRecord.push({
        type: 'Visit (Encounter)',
        entries: [{
          key: 'Start DateTime',
          value: data.visit.startDatetime
        }]
      });
    }
    if(data.cheifComplaints) {
      this.careContextData.OpConsultRecord.push({
        type: 'Cheif Complaints (Condition)',
        entries: [{
          key: 'Cheif Complaints',
          value: data.cheifComplaints.map((cc: any) => cc).join(', ')
        }]
      });
    }
    if(data.physicalExaminations) {
      let physicalExaminationData = [];
      data.physicalExaminations.forEach((pe: any) => {
        pe.data.forEach((p: any) => {
          physicalExaminationData.push({
            key: pe.title + ' ' + p.name,
            value: p.value ? (( typeof p.value == 'object') ? p.value?.display : p.value) : null
          });
        })
      })
      this.careContextData.OpConsultRecord.push({
        type: 'Physical Examinations (Observation)',
        entries: physicalExaminationData
      });
    }
    if(data.diagnosis) {
      this.careContextData.OpConsultRecord.push({
        type: 'Diagnoses (Condition)',
        entries: data.diagnosis.map((diag: any) => {
          return ({
            key: 'Diagnosis',
            value: this.objectValues(diag)
          });
        })
      });
    }
    if(data.vitals) {
      const vitalData = {
        type: 'Vitals (Observation)',
        entries: data.vitals.map((vital: any) => {
          return ({
            key: vital.concept ? ( typeof vital.concept == 'object' ? vital.concept?.display : vital.concept) : 'Vital',
            value: vital?.value ? (( typeof vital.value == 'object') ? vital.value?.display : vital.value) : null
          });
        })
      }
      this.careContextData.WellnessRecord.push(vitalData);
    }
    if(data.medicines) {
      this.careContextData.PrescriptionRecord.push({
        type: 'Medicines (MedicationRequest)',
        entries: data.medicines.map((med: any) => {
          return ({
            key: 'Medicine',
            value: this.objectValues(med)
          });
        })
      });
    }

    if(data.patientHistoryData) {
      let patientHistoryData = [];
      data.patientHistoryData.forEach((pe: any) => {
        if(pe.title !== 'Patient history') return;
        pe.data.forEach((p: any) => {
          patientHistoryData.push({
            key: p.key,
            value: p.value ? (( typeof p.value == 'object') ? p.value?.display : p.value) : null
          });
        })
      })
      this.careContextData.WellnessRecord.push({
        type: 'Patient History (Observation)',
        entries: patientHistoryData
      });
    }

    if(data.doctorUploadedDocs) {
      this.careContextData.HealthDocumentRecord.push({
        type: 'Doctor Uploaded Documents (DocumentReference)',
        entries: data.doctorUploadedDocs.map((doc: any) => {
          return ({
            key: doc.fileName,
            value: ""
          });
        })
      });
    }

    if(data.advices) {
      this.careContextData.OpConsultRecord.push({
        type: 'Advices (Observation)',
        entries: data.advices.map((adv: any) => {
          return ({
            key: 'Advice',
            value: adv.value
          });
        })
      });
    }

    if(data.tests) {
      this.careContextData.OpConsultRecord.push({
        type: 'Tests (Observation)',
        entries: data.tests.map((test: any) => {
          return ({
            key: 'Test',
            value: test.value
          });
        })
      });
    }

    if(data.followUp) {
      this.careContextData.OpConsultRecord.push({
        type: 'Follow Up (Appointment)',
        entries: [{
          key: 'Follow Up',
          value: this.objectValues(data.followUp)
        }]
      });
    }
  }

  objectValues(obj: any): string {
    return Object.entries(obj)
      .filter(([key]) => key !== 'uuid')
      .map(([, value]) => value)
      .join(' ');
  }

  /**
   * Get patient identifier for given identifier type
   * @param {string} identifierType - Identifier type
   * @return {string} - Patient identifier value
   */
  getPatientIdentifier(identifierType: string): string {
    let identifier: string = '';
    if (this.data?.patient) {
      this.data.patient.identifiers.forEach((idf: PatientIdentifierModel) => {
        if (idf.identifierType.display === identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  /**
   * Get age of patient from birthdate
   * @param {string} birthdate - Birthdate
   * @return {string} - Age
   */
  getAge(birthdate: string): string {
    const momentInstance = (moment as any);
    const years = momentInstance().diff(birthdate, 'years');
    const months = momentInstance().diff(birthdate, 'months');
    const days = momentInstance().diff(birthdate, 'days');
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
   * @param {string} attrType - Person attribute type
   * @return {any} - Value for a given attribute type
   */
  getPersonAttributeValue(attrType: string) {
    let val = this.translateService.instant('NA');
    if (this.data?.patient) {
      this.data.patient.person.attributes.forEach((attr: PersonAttributeModel) => {
        if (attrType === attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }
}