import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { CoreService } from 'src/app/services/core/core.service';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { DocImagesModel, EncounterModel, ObsModel, PatientHistoryModel, PatientIdentifierModel, PatientModel, PersonAttributeModel, VisitModel } from 'src/app/model/model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-visit-summary',
  templateUrl: './view-visit-summary.component.html',
  styleUrls: ['./view-visit-summary.component.scss']
})
export class ViewVisitSummaryComponent implements OnInit {

  visit: VisitModel;
  patient: PatientModel;
  baseUrl: string = environment.baseURL;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  vitalObs: ObsModel[] = [];
  cheifComplaints: string[] = [];
  checkUpReasonData: PatientHistoryModel[] = [];
  physicalExaminationData: PatientHistoryModel[] = [];
  patientHistoryData: PatientHistoryModel[] = [];
  eyeImages: DocImagesModel[] = [];
  additionalDocs: DocImagesModel[] = [];
  baseURL = environment.baseURL;
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";
  conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<ViewVisitSummaryComponent>,
    private visitService: VisitService,
    private diagnosisService: DiagnosisService,
    private coreService: CoreService,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.getVisit(this.data.uuid);
  }

  /**
  * Get visit
  * @param {string} uuid - Visit uuid
  * @return {void}
  */
  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: VisitModel) => {
      if (visit) {
        this.visit = visit;
        this.checkVisitStatus(visit.encounters);
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: PatientModel) => {
          if (patient) {
            this.patient = patient;
            this.clinicName = visit.location.display;
            this.getVisitProvider(visit.encounters);
            this.getVitalObs(visit.encounters);
            this.getCheckUpReason(visit.encounters);
            this.getPhysicalExamination(visit.encounters);
            this.getEyeImages(visit);
            this.getMedicalHistory(visit.encounters);
            this.getVisitAdditionalDocs(visit);
          }
        });
      }
    }, (error) => {

    });
  }

  /**
  * Get patient identifier for given identifier type
  * @param {string} identifierType - Identifier type
  * @return {void}
  */
  getPatientIdentifier(identifierType: string) {
    let identifier: string = '';
    if (this.patient) {
      this.patient.identifiers.forEach((idf: PatientIdentifierModel) => {
        if (idf.identifierType.display == identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  /**
  * Check visit status
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  checkVisitStatus(encounters: EncounterModel[]) {
    if (this.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) {
      this.visitStatus = visitTypes.ENDED_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE)) {
      this.visitStatus = visitTypes.COMPLETED_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) {
      this.visitStatus = visitTypes.IN_PROGRESS_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) {
      this.visitStatus = visitTypes.PRIORITY_VISIT;
    } else if (this.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) || this.checkIfEncounterExists(encounters, visitTypes.VITALS)) {
      this.visitStatus = visitTypes.AWAITING_VISIT;
    }
  }

  /**
  * Get encounter for a given encounter type
  * @param {EncounterModel[]} encounters - Array of encounters
  * @param {string} encounterType - Encounter type
  * @return {EncounterModel} - Encounter for a given encounter type
  */
  checkIfEncounterExists(encounters: EncounterModel[], visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  /**
  * Get age of patient from birthdate
  * @param {string} birthdate - Birthdate
  * @return {string} - Age
  */
  getAge(birthdate: string) {
    let years = moment().diff(birthdate, 'years');
    let months = moment().diff(birthdate, 'months');
    let days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} years`;
    } else if (months > 1) {
      return `${months} months`;
    } else {
      return `${days} days`;
    }
  }

  /**
  * Get person attribute value for a given attribute type
  * @param {str'} attrType - Person attribute type
  * @return {any} - Value for a given attribute type
  */
  getPersonAttributeValue(attrType: string) {
    let val = 'NA';
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: PersonAttributeModel) => {
        if (attrType == attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  /**
  * Replcae the string charaters with *
  * @param {string} str - Original string
  * @return {string} - Modified string
  */
  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(0, n - 4), "*****");
  }

  /**
  * Get visit provider details
  * @param {EncounterModel[]} encounters - Array of visit encounters
  * @return {void}
  */
  getVisitProvider(encounters: EncounterModel[]) {
    encounters.forEach((encounter: EncounterModel) => {
      if (encounter.display.match(visitTypes.ADULTINITIAL) !== null) {
        this.providerName = encounter.encounterProviders[0].display;
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
  * Get vital observations from the vital encounter
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getVitalObs(encounters: EncounterModel[]) {
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display == visitTypes.VITALS) {
        this.vitalObs = enc.obs;
      }
    });
  }

  /**
  * Get observation value for a given observation name
  * @param {string} obsName - Observation name
  * @return {any} - Obs value
  */
  getObsValue(obsName: string) {
    let val = null;
    this.vitalObs.forEach((obs: ObsModel) => {
      if (obs.concept.display == obsName) {
        val = obs.value;
      }
    });
    return val;
  }

  /**
  * Get chief complaints and patient visit reason/summary
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getCheckUpReason(encounters: EncounterModel[]) {
    this.cheifComplaints = [];
    this.checkUpReasonData = [];
    encounters.forEach((enc: EncounterModel) => {
      if (enc.encounterType.display == visitTypes.ADULTINITIAL) {
        enc.obs.forEach((obs: ObsModel) => {
          if (obs.concept.display == visitTypes.CURRENT_COMPLAINT) {
            const currentComplaint =  this.visitService.getData(obs)?.value.replace(new RegExp('►', 'g'),'').split('<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i] && currentComplaint[i].length > 1) {
                const obs1 = currentComplaint[i].split('<');
                if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  this.cheifComplaints.push(obs1[0]);
                }

                const splitByBr = currentComplaint[i].split('<br/>');
                if (splitByBr[0].includes(visitTypes.ASSOCIATED_SYMPTOMS)) {
                  let obj1: PatientHistoryModel = {};
                  obj1.title = visitTypes.ASSOCIATED_SYMPTOMS;
                  obj1.data = [];
                  for (let j = 1; j < splitByBr.length; j = j + 2) {
                    if (splitByBr[j].trim() && splitByBr[j].trim().length > 1) {
                      obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1] });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                } else {
                  let obj1: PatientHistoryModel = {};
                  obj1.title = splitByBr[0].replace('</b>:', '');
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim() && splitByBr[k].trim().length > 1) {
                      const splitByDash = splitByBr[k].split('-');
                      obj1.data.push({ key: splitByDash[0].replace('• ', ''), value: splitByDash.slice(1, splitByDash.length).join('-') });
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
  * Get physical examination details
  * @param {EncounterModel[]} encounters - Array of encounters
  * @return {void}
  */
  getPhysicalExamination(encounters: EncounterModel[]) {
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
  getMedicalHistory(encounters: EncounterModel[]) {
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
                  const splitByComma = splitByColon[1].split(',');
                  obj1.data.push({ key: splitByComma[0].trim().replace('•', ''), value: splitByComma[1] ? splitByComma[1].replace('•', '') : " " });
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
  getEyeImages(visit: VisitModel) {
    this.eyeImages = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptPhysicalExamination).subscribe((response) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value`, section:obs.comment};
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
  previewEyeImages(index: number,section: string) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.getImagesBySection(section) }).subscribe((res) => { });
  }

  /**
  * Get additional docs
  * @param {VisitModel} visit - Visit
  * @return {void}
  */
  getVisitAdditionalDocs(visit: VisitModel) {
    this.additionalDocs = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptAdditionlDocument).subscribe((response) => {
      response.results.forEach((obs: ObsModel) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value`, section:obs.comment};
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
  previewDocImages(index: number) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.additionalDocs }).subscribe((res) => {});
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

  /**
  * Getting Images by section
  * @param {string} section - Section Title
  * @returns {arra}
  */
  getImagesBySection(section){
    return this.eyeImages.filter(o=>o.section?.toLowerCase() === section?.toLowerCase());
  }

  /**
  * Get whatsapp link
  * @return {string} - Whatsapp link
  */
  getWhatsAppLink() {
    return this.visitService.getWhatsappLink(this.getPersonAttributeValue(doctorDetails.TELEPHONE_NUMBER), `Hello I'm calling for consultation`);
  }

}
