import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { ProfileService } from 'src/app/services/profile.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-visit-prescription',
  templateUrl: './view-visit-prescription.component.html',
  styleUrls: ['./view-visit-prescription.component.scss']
})
export class ViewVisitPrescriptionComponent implements OnInit {
  @Input() isDownloadPrescription: any = false;
  @Input() visitId: any;

  locale: any = localStorage.getItem('selectedLanguage');
  visit: any;
  patient: any;
  baseUrl: string = environment.baseURL;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  baseURL = environment.baseURL;
  visitNotePresent: any = false;
  spokenWithPatient: any = 'No';
  diagnosis: any;
  notes: any = [];
  medicines: any = [];
  existingDiagnosis: any = [];
  advices: any = [];
  additionalInstructions: any = [];
  tests: any = [];
  referrals: any = [];
  followUp: any;
  consultedDoctor: any;

  conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptNote = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
  conceptReferral = "605b6f15-8f7a-4c45-b06d-14165f6974be";
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';

  signaturePicUrl: any = null;
  signatureFile: any = null;
  completedEncounter: any = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ViewVisitPrescriptionComponent>,
    private visitService: VisitService,
    private profileService: ProfileService,
    private diagnosisService: DiagnosisService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.getVisit(this.isDownloadPrescription ? this.visitId : this.data.uuid);
    moment.locale(localStorage.getItem('selectedLanguage'));
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
            // check if visit note exists for this visit
            this.visitNotePresent = this.checkIfEncounterExists(visit.encounters, 'Visit Note');
            if (this.visitNotePresent) {
              this.checkIfPatientInteractionPresent(visit.attributes);
              this.checkIfDiagnosisPresent();
              this.checkIfNotePresent();
              this.checkIfMedicationPresent();
              this.checkIfAdvicePresent();
              this.checkIfTestPresent();
              this.checkIfReferralPresent();
              this.checkIfFollowUpPresent();
            }

            visit.encounters.forEach((encounter: any) => {
              if (encounter.encounterType.display == 'Visit Complete') {
                this.completedEncounter = encounter;
                encounter.obs.forEach((o: any) => {
                  if (o.concept.display == 'Doctor details') {
                    this.consultedDoctor = JSON.parse(o.value);
                  }
                });
                encounter.encounterProviders.forEach((p: any) => {
                  this.consultedDoctor.gender = p.provider.person.gender;
                  this.consultedDoctor.person_uuid = p.provider.person.uuid;
                  this.consultedDoctor.attributes = p.provider.attributes;
                  if (this.isDownloadPrescription) {
                    this.setSignature(this.signature?.value, this.signatureType?.value);
                  }
                });
              }
            });
          }
        });
      }
    }, (error: any) => {

    });
  }

  checkIfPatientInteractionPresent(attributes: any) {
    attributes.forEach((attr: any) => {
      if (attr.attributeType.display == 'Patient Interaction') {
        this.spokenWithPatient = attr.value;
      }
    });
  }

  checkIfDiagnosisPresent() {
    this.existingDiagnosis = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptDiagnosis).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.existingDiagnosis.push({
            diagnosisName: obs.value.split(':')[0].trim(),
            diagnosisType: obs.value.split(':')[1].split('&')[0].trim(),
            diagnosisStatus: obs.value.split(':')[1].split('&')[1].trim(),
            uuid: obs.uuid
          });
          // this.diagnosis = {
          //   present: true,
          //   diagnosisIdentified: 'Yes',
          //   diagnosisName: obs.value.split(':')[0].trim(),
          //   diagnosisType: obs.value.split(':')[1].split('&')[0].trim(),
          //   diagnosisStatus: obs.value.split(':')[1].split('&')[1].trim()
          // };
        }
      });
    });
  }

  checkIfNotePresent() {
    this.notes = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptNote).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.notes.push(obs);
        }
      });
    });
  }

  checkIfMedicationPresent() {
    this.medicines = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptMed).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if (obs.value.includes(":")) {
            this.medicines.push({
              drug: obs.value?.split(":")[0],
              strength: obs.value?.split(":")[1],
              days: obs.value?.split(":")[2],
              timing: obs.value?.split(":")[3],
              remark: obs.value?.split(":")[4],
              uuid: obs.uuid
            });
          } else {
            this.additionalInstructions.push(obs);
          }
        }
      });
    });
  }

  checkIfAdvicePresent() {
    this.advices = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptAdvice)
      .subscribe((response: any) => {
        response.results.forEach((obs: any) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            if (!obs.value.includes('</a>')) {
              this.advices.push(obs);
            }
          }
        });
      });
  }

  checkIfTestPresent() {
    this.tests = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptTest)
      .subscribe((response: any) => {
        response.results.forEach((obs: any) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.tests.push(obs);
          }
        });
      });
  }

  checkIfReferralPresent() {
    this.referrals = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptReferral)
      .subscribe((response: any) => {
        response.results.forEach((obs: any) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
            this.referrals.push({ uuid: obs.uuid, speciality: obs.value.split(':')[0].trim(), remark: obs.value.split(':')[1].trim() });
          }
        });
      });
  }

  checkIfFollowUpPresent() {
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptFollow).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          let followUpDate = (obs.value.includes('Time:')) ? moment(obs.value.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(obs.value.split(', Remark: ')[0]).format('YYYY-MM-DD');
          let followUpTime = (obs.value.includes('Time:')) ? obs.value.split(', Time: ')[1].split(', Remark: ')[0] : null;
          let followUpReason = (obs.value.split(', Remark: ')[1]) ? obs.value.split(', Remark: ')[1] : null;
          this.followUp = {
            present: true,
            wantFollowUp: 'Yes',
            followUpDate,
            followUpTime,
            followUpReason
          };
        }
      });
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

  close(val: any) {
    this.dialogRef.close(val);
  }

  get isPrescriptionModal() {
    return location.hash.includes('#/i/')
  }

  get attributes() {
    return Array.isArray(this.consultedDoctor?.attributes) ? this.consultedDoctor.attributes : [];
  }

  get signatureType() {
    return this.attributes.find(a => a?.attributeType?.display === "signatureType");
  }

  get signature() {
    return this.attributes.find(a => a?.attributeType?.display === "signature");
  }

  detectMimeType(b64: string) {
    return this.profileService.detectMimeType(b64);
  }

  setSignature(signature, signatureType) {
    switch (signatureType) {
      case 'Draw':
      case 'Generate':
      case 'Upload':
        this.signaturePicUrl = signature;
        fetch(signature)
          .then(res => res.blob())
          .then(blob => {
            this.signatureFile = new File([blob], "intelehealth", { type: this.detectMimeType(signature.split(',')[0]) });
          });
        break;
      default:
        break;
    }
  }
}
