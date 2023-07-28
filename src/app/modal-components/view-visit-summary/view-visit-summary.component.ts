import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { CoreService } from 'src/app/services/core/core.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-visit-summary',
  templateUrl: './view-visit-summary.component.html',
  styleUrls: ['./view-visit-summary.component.scss']
})
export class ViewVisitSummaryComponent implements OnInit {

  locale: any = localStorage.getItem('selectedLanguage');
  visit: any;
  patient: any;
  baseUrl: string = environment.baseURL;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  vitalObs: any = [];
  cheifComplaints: any = [];
  checkUpReasonData: any = [];
  physicalExaminationData: any = [];
  patientHistoryData: any = [];
  eyeImages: any = [];
  additionalDocs: any = [];
  baseURL = environment.baseURL;
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";
  conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewVisitSummaryComponent>,
    private visitService: VisitService,
    private diagnosisService: DiagnosisService,
    private coreService: CoreService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.getVisit(this.data.uuid);
    // moment.locale(localStorage.getItem('selectedLanguage'));
  }

  getVisit(uuid: string) {
    this.visitService.fetchVisitDetails(uuid).subscribe((visit: any) => {
      if (visit) {
        this.visit = visit;
        this.checkVisitStatus(visit.encounters);
        this.visitService.patientInfo(visit.patient.uuid).subscribe((patient: any) => {
          if (patient) {
            this.patient = patient;
            this.clinicName = visit.location.display;
            // this.getAppointment(visit.uuid);
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
    }, (error: any) => {

    });
  }

  getPatientIdentifier(identifierType: string) {
    if (this.patient) {
      this.patient.identifiers.forEach((idf: any) => {
        if (idf.identifierType == 'OpenMRS ID') {
          return idf.identifier;
        }
      });
    }
  }

  checkVisitStatus(encounters: any) {
    if (this.checkIfEncounterExists(encounters, 'Patient Exit Survey')) {
      this.visitStatus = 'Ended Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Complete')) {
      this.visitStatus = 'Completed Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Visit Note')) {
      this.visitStatus = 'In-progress Visit';
    } else if (this.checkIfEncounterExists(encounters, 'Flagged')) {
      this.visitStatus = 'Priority Visit';
    } else if (this.checkIfEncounterExists(encounters, 'ADULTINITIAL') || this.checkIfEncounterExists(encounters, 'Vitals')) {
      this.visitStatus = 'Awaiting Visit';
    }
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  getAge(birthdate: string) {
    let years = moment().diff(birthdate, 'years');
    var months = moment().diff(birthdate, 'months');
    let days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} ${this.translateService.instant("years")}`;
    } else if (months > 1) {
      return `${months} ${this.translateService.instant("months")}`;
    } else {
      return `${days} ${this.translateService.instant("days")}`;
    }
  }

  getPersonAttributeValue(attrType: string) {
    let val = 'NA';
    if (this.patient) {
      this.patient.person.attributes.forEach((attr: any) => {
        if (attrType == attr.attributeType.display) {
          val = attr.value;
        }
      });
    }
    return val;
  }

  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(0, n - 4), "*****");
  }

  getVisitProvider(encounters: any) {
    encounters.forEach((encounter: any) => {
      if (encounter.display.match("ADULTINITIAL") !== null) {
        this.providerName = encounter.encounterProviders[0].display;
        encounter.encounterProviders[0].provider.attributes.forEach(
          (attribute) => {
            if (attribute.display.match("phoneNumber") != null) {
              this.hwPhoneNo = attribute.value;
            }
          }
        );
      }
    });
  }

  getVitalObs(encounters: any) {
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display == 'Vitals') {
        this.vitalObs = enc.obs;
      }
    });
  }

  getObsValue(obsName: string) {
    let val = null;
    this.vitalObs.forEach((obs: any) => {
      if (obs.concept.display == obsName) {
        val = obs.value;
      }
    });
    return val;
  }

  getCheckUpReason(encounters: any) {
    this.cheifComplaints = [];
    this.checkUpReasonData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display == 'ADULTINITIAL') {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display == 'CURRENT COMPLAINT') {
            const currentComplaint = obs.value.split('<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i] && currentComplaint[i].length > 1) {
                const obs1 = currentComplaint[i].split('<');
                if (!obs1[0].match('Associated symptoms')) {
                  this.cheifComplaints.push(obs1[0]);
                }

                const splitByBr = currentComplaint[i].split('<br/>');
                if (splitByBr[0].includes('Associated symptoms')) {
                  let obj1: any = {};
                  obj1.title = 'Associated symptoms';
                  obj1.data = [];
                  for (let j = 1; j < splitByBr.length; j = j + 2) {
                    if (splitByBr[j].trim() && splitByBr[j].trim().length > 1) {
                      obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1] });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                } else {
                  let obj1: any = {};
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

  getPhysicalExamination(encounters: any) {
    this.physicalExaminationData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display == 'ADULTINITIAL') {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display == 'PHYSICAL EXAMINATION') {
            const physicalExam = obs.value.split('<b>');
            for (let i = 0; i < physicalExam.length; i++) {
              if (physicalExam[i]) {
                const splitByBr = physicalExam[i].split('<br/>');

                if (splitByBr[0].includes('Abdomen')) {
                  let obj1: any = {};
                  obj1.title = splitByBr[0].replace('</b>', '').replace(':', '').trim();
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim()) {
                      obj1.data.push({ key: splitByBr[k].replace('• ', ''), value: null });
                    }
                  }
                  this.physicalExaminationData.push(obj1);
                } else {
                  let obj1: any = {};
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

  getMedicalHistory(encounters: any) {
    this.patientHistoryData = [];
    encounters.forEach((enc: any) => {
      if (enc.encounterType.display == 'ADULTINITIAL') {
        enc.obs.forEach((obs: any) => {
          if (obs.concept.display == 'MEDICAL HISTORY') {
            const medicalHistory = obs.value.split('<br/>');
            let obj1: any = {};
            obj1.title = 'Patient history';
            obj1.data = [];
            for (let i = 0; i < medicalHistory.length; i++) {
              if (medicalHistory[i]) {
                const splitByDash = medicalHistory[i].split('-');
                obj1.data.push({ key: splitByDash[0].replace('• ', '').trim(), value: splitByDash.slice(1, splitByDash.length).join('-').trim() });
              }
            }
            this.patientHistoryData.push(obj1);
          }

          if (obs.concept.display == 'FAMILY HISTORY') {
            const familyHistory = obs.value.split('<br/>');
            let obj1: any = {};
            obj1.title = 'Family history';
            obj1.data = [];
            for (let i = 0; i < familyHistory.length; i++) {
              if (familyHistory[i]) {
                const splitByColon = familyHistory[i].split(':');
                const splitByComma = splitByColon[1].split(',');
                obj1.data.push({ key: splitByComma[0].trim(), value: splitByComma[1] });
              }
            }
            this.patientHistoryData.push(obj1);
          }
        });
      }
    });
  }

  getEyeImages(visit: any) {
    this.eyeImages = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptPhysicalExamination).subscribe((response) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value` };
          this.eyeImages.push(data);
        }
      });
    });
  }

  previewEyeImages(index: number) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.eyeImages }).subscribe((res: any) => {});
  }

  getVisitAdditionalDocs(visit: any) {
    this.additionalDocs = [];
    this.diagnosisService.getObs(visit.patient.uuid, this.conceptAdditionlDocument).subscribe((response) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter !== null && obs.encounter.visit.uuid === visit.uuid) {
          const data = { src: `${this.baseURL}/obs/${obs.uuid}/value` };
          this.additionalDocs.push(data);
        }
      });
    });
  }

  previewDocImages(index: number) {
    this.coreService.openImagesPreviewModal({ startIndex: index, source: this.additionalDocs }).subscribe((res: any) => {});
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
