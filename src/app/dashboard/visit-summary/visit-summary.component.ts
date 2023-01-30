import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { AppointmentService } from 'src/app/services/appointment.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss']
})
export class VisitSummaryComponent implements OnInit {

  visit: any;
  patient: any;
  baseUrl: string = environment.baseURL;
  visitAppointment: any;
  visitStatus: string;
  providerName: string;
  hwPhoneNo: string;
  clinicName: string;
  vitalObs: any = [];
  cheifComplaints: any = [];
  checkUpReasonData: any = [];
  physicalExaminationData: any = [];
  patientHistoryData: any = [];
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";
  conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';
  baseURL = environment.baseURL;
  additionalDocs: any = [];
  eyeImages: any = [];
  specializations: any[] = [
    {
      id: 1,
      name: 'General Physician'
    },
    {
      id: 2,
      name: 'Dermatologist'
    },
    {
      id: 3,
      name: 'Gynecologist'
    },
    {
      id: 4,
      name: 'Pediatrician'
    }
  ];
  visitNotePresent: boolean = false;
  referSpecialityForm: FormGroup;
  provider: any;
  showAll: boolean = true;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private appointmentService: AppointmentService,
    private diagnosisService: DiagnosisService,
    private toastr: ToastrService,
    private coreService: CoreService,
    private encounterService: EncounterService) {
      this.referSpecialityForm = new FormGroup({
        refer: new FormControl(false, [Validators.required]),
        specialization: new FormControl(null, [Validators.required])
      });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = JSON.parse(localStorage.getItem("provider"));
    this.getVisit(id);
    this.formControlValueChanges();
  }

  formControlValueChanges() {
    this.referSpecialityForm.get('refer').valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.referSpecialityForm.get('specialization').setValue(null);
      }
    });
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
            this.visitNotePresent = this.checkIfEncounterExists(visit.encounters, 'Visit Note');
            this.getAppointment(visit.uuid);
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
      this.router.navigate(['/dashboard']);
    });
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

  getAppointment(visitId: string) {
    this.appointmentService.getAppointment(visitId).subscribe((res: any) => {
      if (res) {
        this.visitAppointment = res?.data?.slotDate;
      }
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
            const currentComplaint = obs.value.split('►<b>');
            for (let i = 0; i < currentComplaint.length; i++) {
              if (currentComplaint[i]) {
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
                    if (splitByBr[j].trim()) {
                      obj1.data.push({ key: splitByBr[j].replace('• ', '').replace(' -', ''), value: splitByBr[j + 1] });
                    }
                  }
                  this.checkUpReasonData.push(obj1);
                } else {
                  let obj1: any = {};
                  obj1.title = splitByBr[0].replace('</b>:', '');
                  obj1.data = [];
                  for (let k = 1; k < splitByBr.length; k++) {
                    if (splitByBr[k].trim()) {
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
                obj1.data.push({ key: splitByComma[0].trim(), value: splitByComma[1].replace('.','').trim() });
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

  onTabChange(event: number) {
    console.log(event);
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  getAge(birthdate: string) {
    let years = moment().diff(birthdate, 'years');
    var months = moment().diff(birthdate, 'months');
    let days = moment().diff(birthdate, 'days');
    if (years > 1) {
      return `${years} years`;
    } else if (months > 1) {
      return `${months} months`;
    } else {
      return `${days} days`;
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

  getWhatsAppLink() {
    return this.visitService.getWhatsappLink(this.getPersonAttributeValue('Telephone Number'), `Hello I'm calling for consultation`);
  }

  replaceWithStar(str: string) {
    let n = str.length;
    return str.replace(str.substring(0, n - 4), "*****");
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
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

  referSpecialist() {
    if (this.referSpecialityForm.invalid) {
      this.toastr.warning("Please select specialization", "Invalid!");
      return;
    }

    if (this.visitNotePresent) {
      this.toastr.warning("Can't refer, visit note already exists for this visit!", "Can't refer");
      return;
    }

    this.coreService.openConfirmationDialog({confirmationMsg: 'Are you sure to re-assign this visit to another doctor?' })
    .afterClosed().subscribe((res: any) => {
      if (res) {
        let attr = this.checkIfAttributeExists(this.visit.attributes);
        if (attr) {
          this.visitService.updateAttribute(this.visit.uuid, attr.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.speciality }).subscribe((result: any) =>{
            if (result) {
              this.updateEncounterForRefer();
            }
          });
        } else {
          this.visitService.postAttribute(this.visit.uuid, { attributeType: attr.attributeType.uuid, value: this.referSpecialityForm.value.speciality }).subscribe((result: any) =>{
            if (result) {
              this.updateEncounterForRefer();
            }
          });
        }
      }
    });
  }

  updateEncounterForRefer() {
    const timestamp = new Date(Date.now() - 30000);
    const patientUuid = this.visit.patient.uuid;
    const providerUuid = this.provider.uuid;
    const json = {
      patient: patientUuid,
      encounterType: "8d5b27bc-c2cc-11de-8d13-0010c6dffd0f", //ADULTINITIAL encounter
      encounterProviders: [
        {
          provider: providerUuid,
          encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e04", // Doctor encounter role
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: timestamp,
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.router.navigate(["/dashboard"]);
        this.toastr.success("Visit has been re-assigned to the another speciality doctor successfully.","Visit Re-assigned!")
      }
    });
  }

  checkIfAttributeExists(attrs: any) {
    let currentAttr;
    attrs.array.forEach((attr: any) => {
      if (attr.attributeType.display == 'Visit Speciality') {
        currentAttr = attr;
      }
    });
    return currentAttr;
  }

  startChat() {

  }

  startCall() {

  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment(data).diff(moment(), 'hours');
    let minutes = moment(data).diff(moment(), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm A');
    };
    if (hours < 1) {
      if(minutes < 0) return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`;
      return `${minutes} minutes`;
    }
    return `${hours} hrs`;
  }

  startVisitNote() {
    const json = {
      patient: this.patient.uuid,
      encounterType: "d7151f82-c1f3-4152-a605-2f9ea7414a79",
      encounterProviders: [
        {
          provider: this.provider.uuid,
          encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03",
        },
      ],
      visit: this.visit.uuid,
      encounterDatetime: new Date(Date.now() - 30000),
    };
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.getVisit(this.visit.uuid);
      }
    });
  }

}
