import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import medicines from '../../core/data/medicines';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'app-visit-summary',
  templateUrl: './visit-summary.component.html',
  styleUrls: ['./visit-summary.component.scss']
})
export class VisitSummaryComponent implements OnInit, OnDestroy {

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
  conceptDiagnosis = '537bb20d-d09d-4f88-930b-cc45c7d662df';
  conceptNote = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  conceptMed = 'c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca';
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  conceptTest = '23601d71-50e6-483f-968d-aeef3031346d';
  conceptReferral = "605b6f15-8f7a-4c45-b06d-14165f6974be";
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';

  baseURL = environment.baseURL;
  additionalDocs: any = [];
  eyeImages: any = [];
  notes: any = [];
  medicines: any = [];
  advices: any = [];
  additionalInstructions: any = [];
  tests: any = [];
  referrals: any = [];
  pastVisits: any = [];

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
  diagnosis: any[] = [
    {
      id: 1,
      name: 'Viral Flu'
    }
  ];
  strengthList: any[] = [
    {
      id: 1,
      name: '5 Mg'
    },
    {
      id: 2,
      name: '10 Mg'
    },
    {
      id: 3,
      name: '50 Mg'
    },
    {
      id: 4,
      name: '75 Mg'
    },
    {
      id: 5,
      name: '100 Mg'
    },
    {
      id: 6,
      name: '500 Mg'
    },
    {
      id: 7,
      name: '1000 Mg'
    }
  ];
  daysList: any[] = [
    {
      id: 1,
      name: '7'
    },
    {
      id: 2,
      name: '14'
    },
    {
      id: 3,
      name: '20'
    },
    {
      id: 4,
      name: '25'
    },
    {
      id: 5,
      name: '30'
    }
  ];
  timingList: any[] = [
    {
      id: 1,
      name: '1 - 0 - 0'
    },
    {
      id: 2,
      name: '0 - 1 - 0'
    },
    {
      id: 3,
      name: '0 - 0 - 1'
    },
    {
      id: 4,
      name: '1 - 1 - 0'
    },
    {
      id: 5,
      name: '1 - 0 - 1'
    },
    {
      id: 6,
      name: '0 - 1 - 1'
    },
    {
      id: 7,
      name: '1 - 1 - 1'
    }
  ];
  drugNameList: any = [];
  advicesList: any = [];
  testsList: any = [];

  visitEnded: any = false;
  visitCompleted: any = false;
  visitNotePresent: any = false;
  isVisitNoteProvider: boolean = false;
  referSpecialityForm: FormGroup;
  provider: any;
  showAll: boolean = true;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  addMoreNote: boolean = false;
  addMoreMedicine: boolean = false;
  addMoreAdditionalInstruction: boolean = false;
  addMoreAdvice: boolean = false;
  addMoreTest: boolean = false;
  addMoreReferral: boolean = false;

  patientInteractionForm: FormGroup;
  diagnosisForm: FormGroup;
  addNoteForm: FormGroup;
  addMedicineForm: FormGroup;
  addAdditionalInstructionForm: FormGroup;
  addAdviceForm: FormGroup;
  addTestForm: FormGroup;
  addReferralForm: FormGroup;
  followUpForm: FormGroup;

  displayedColumns: string[] = ['action', 'created_on', 'consulted_by', 'cheif_complaint', 'summary', 'prescription', 'prescription_sent'];
  dataSource = new MatTableDataSource<any>();

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.advicesList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  search2 = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? [] : this.testsList.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
  )

  constructor(
    private pageTitleService: PageTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private appointmentService: AppointmentService,
    private diagnosisService: DiagnosisService,
    private toastr: ToastrService,
    private coreService: CoreService,
    private encounterService: EncounterService,
    private socket: SocketService) {
      this.referSpecialityForm = new FormGroup({
        refer: new FormControl(false, [Validators.required]),
        specialization: new FormControl(null, [Validators.required])
      });

      this.patientInteractionForm = new FormGroup({
        present: new FormControl(false, [Validators.required]),
        spoken: new FormControl(null, [Validators.required])
      });

      this.diagnosisForm = new FormGroup({
        present: new FormControl(false, [Validators.required]),
        diagnosisIdentified: new FormControl('No', [Validators.required]),
        diagnosisName: new FormControl(null),
        diagnosisType: new FormControl(null),
        diagnosisStatus: new FormControl(null)
      });

      this.addNoteForm = new FormGroup({
        note: new FormControl(null, [Validators.required])
      });

      this.addMedicineForm = new FormGroup({
        drug: new FormControl(null, [Validators.required]),
        strength: new FormControl(null, [Validators.required]),
        days: new FormControl(null, [Validators.required]),
        timing: new FormControl(null, [Validators.required]),
        remark: new FormControl(null, [Validators.required])
      });

      this.addAdditionalInstructionForm = new FormGroup({
        note: new FormControl(null, [Validators.required])
      });

      this.addAdviceForm = new FormGroup({
        advice: new FormControl(null, [Validators.required])
      });

      this.addTestForm = new FormGroup({
        test: new FormControl(null, [Validators.required])
      });

      this.addReferralForm = new FormGroup({
        speciality: new FormControl(null, [Validators.required]),
        remark: new FormControl(null, [Validators.required]),
      });

      this.followUpForm = new FormGroup({
        present: new FormControl(false, [Validators.required]),
        wantFollowUp: new FormControl('No', [Validators.required]),
        followUpDate: new FormControl(null),
        followUpReason: new FormControl(null)
      });
  }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: '', imgUrl: '' });
    const id = this.route.snapshot.paramMap.get('id');
    this.provider = JSON.parse(localStorage.getItem("provider"));
    this.drugNameList = this.drugNameList.concat(medicines);
    this.getVisit(id);
    this.formControlValueChanges();
  }

  formControlValueChanges() {
    this.referSpecialityForm.get('refer').valueChanges.subscribe((val: boolean) => {
      if (val) {
        this.referSpecialityForm.get('specialization').setValue(null);
      }
    });

    this.diagnosisForm.get('diagnosisIdentified').valueChanges.subscribe((val: any) => {
      if (val == 'Yes') {
        this.diagnosisForm.get('diagnosisName').setValidators(Validators.required);
        this.diagnosisForm.get('diagnosisName').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisType').setValidators(Validators.required);
        this.diagnosisForm.get('diagnosisType').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisStatus').setValidators(Validators.required);
        this.diagnosisForm.get('diagnosisStatus').updateValueAndValidity();
      } else {
        this.diagnosisForm.get('diagnosisName').clearValidators();
        this.diagnosisForm.get('diagnosisName').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisType').clearValidators();
        this.diagnosisForm.get('diagnosisType').updateValueAndValidity();
        this.diagnosisForm.get('diagnosisStatus').clearValidators();
        this.diagnosisForm.get('diagnosisStatus').updateValueAndValidity();
      }
    });

    this.followUpForm.get('wantFollowUp').valueChanges.subscribe((val: any) => {
      if (val == 'Yes') {
        this.followUpForm.get('followUpDate').setValidators(Validators.required);
        this.followUpForm.get('followUpDate').updateValueAndValidity();
      } else {
        this.diagnosisForm.get('followUpDate').clearValidators();
        this.diagnosisForm.get('followUpDate').updateValueAndValidity();
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
            // check if visit note exists for this visit
            this.visitNotePresent = this.checkIfEncounterExists(visit.encounters, 'Visit Note');
            // check if visit complete exists for this visit
            this.visitCompleted = this.checkIfEncounterExists(visit.encounters, 'Visit Complete');
            // check if visit note provider and logged in provider are same
            this.visitEnded = this.checkIfEncounterExists(visit.encounters, 'Patient Exit Survey');
            // check if visit note provider and logged in provider are same
            if (this.visitNotePresent) {
              this.visitNotePresent.encounterProviders.forEach((p: any) => {
                if(p.provider.uuid == this.provider.uuid) {
                  this.isVisitNoteProvider = true;
                }
              });
              this.getPastVisitHistory();
              this.checkIfPatientInteractionPresent(visit.attributes);
              this.checkIfDiagnosisPresent();
              this.checkIfNotePresent();
              this.checkIfMedicationPresent();
              this.getAdvicesList();
              this.checkIfAdvicePresent();
              this.getTestsList();
              this.checkIfTestPresent();
              this.checkIfReferralPresent();
              this.checkIfFollowUpPresent();
            }
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
        // store visit provider in localStorage
        localStorage.setItem('patientVisitProvider', JSON.stringify(encounter.encounterProviders[0]));
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
    this.coreService.openChatBoxModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID')
    }).subscribe((res: any) =>{

    });
  }

  startCall() {
    this.coreService.openVideoCallModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      connectToDrId: this.provider?.person?.uuid,
      patientName: this.patient.person.display,
      patientPersonUuid: this.patient.person.uuid,
      patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID'),
      initiator: 'dr'
    });
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
      patient: this.visit.patient.uuid,
      encounterType: "d7151f82-c1f3-4152-a605-2f9ea7414a79", // Visit Note encounter
      encounterProviders: [
        {
          provider: this.provider.uuid,
          encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03", // Doctor encounter role
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


  checkIfPatientInteractionPresent(attributes: any) {
    attributes.forEach((attr: any) => {
      if (attr.attributeType.display == 'Patient Interaction') {
        this.patientInteractionForm.patchValue({ present: true, spoken: attr.value });
      }
    });
  }


  savePatientInteraction() {
    if (this.patientInteractionForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.visitService.postAttribute(this.visit.uuid, { attributeType: "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc", value: this.patientInteractionForm.value.spoken })
    .subscribe((res: any) => {
      if (res) {
        this.patientInteractionForm.patchValue({ present: true });
      }
    })
  }

  checkIfDiagnosisPresent() {
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptDiagnosis).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          this.diagnosisForm.patchValue({
            present: true,
            diagnosisIdentified: 'Yes',
            diagnosisName: obs.value.split(':')[0].trim(),
            diagnosisType: obs.value.split(':')[1].split('&')[0].trim(),
            diagnosisStatus: obs.value.split(':')[1].split('&')[1].trim()
          });
        }
      });
    });
  }

  searchDiagnosis(event: any) {
    this.diagnosisService.getDiagnosisList(event.target.value).subscribe(response => {
        this.diagnosis = response;
    });
  }

  saveDiagnosis() {
    if (this.diagnosisForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.encounterService.postObs({
        concept: this.conceptDiagnosis,
        person: this.visit.patient.uuid,
        obsDatetime: new Date(),
        value: `${this.diagnosisForm.value.diagnosisName}:${this.diagnosisForm.value.diagnosisType} & ${this.diagnosisForm.value.diagnosisStatus}`,
        encounter: this.visitNotePresent.uuid
      }).subscribe((res: any) => {
        if (res) {
          this.diagnosisForm.patchValue({ present: true });
        }
      });
  }

  toggleNote() {
    this.addMoreNote = !this.addMoreNote;
    this.addNoteForm.reset();
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

  addNote() {
    if (this.addNoteForm.invalid) {
      this.toastr.warning("Please enter note text to add", "Invalid note");
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptNote,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addNoteForm.value.note,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: any) => {
      this.notes.push({ uuid: res.uuid, value: this.addNoteForm.value.note });
      this.addNoteForm.reset();
    });
  }

  deleteNote(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe((res: any) => {
      this.notes.splice(index, 1);
    });
  }

  toggleMedicine() {
    this.addMoreMedicine = !this.addMoreMedicine;
    this.addMedicineForm.reset();
  }

  toggleAdditionalInstruction() {
    this.addMoreAdditionalInstruction = !this.addMoreAdditionalInstruction;
    this.addAdditionalInstructionForm.reset();
  }

  checkIfMedicationPresent() {
    this.medicines = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptMed).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          if(obs.value.includes(":")) {
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

  addMedicine() {
    if (this.addMedicineForm.invalid) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptMed,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${this.addMedicineForm.value.drug}:${this.addMedicineForm.value.strength}:${this.addMedicineForm.value.days}:${this.addMedicineForm.value.timing}:${this.addMedicineForm.value.remark}`,
      encounter: this.visitNotePresent.uuid
    }).subscribe(response => {
      this.medicines.push({ ...this.addMedicineForm.value, uuid: response.uuid });
      this.addMedicineForm.reset();
    });
  }

  addAdditionalInstruction() {
    if (this.addAdditionalInstructionForm.invalid) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptMed,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addAdditionalInstructionForm.value.note,
      encounter: this.visitNotePresent.uuid
    }).subscribe(response => {
      this.additionalInstructions.push({ uuid: response.uuid, value: this.addAdditionalInstructionForm.value.note });
      this.addAdditionalInstructionForm.reset();
    });
  }

  deleteMedicine(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.medicines.splice(index, 1);
    });
  }

  deleteAdditionalInstruction(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe((res) => {
      this.additionalInstructions.splice(index, 1);
    });
  }

  getAdvicesList() {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid).subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.advicesList.push(ans.display);
      });
    });
  }

  toggleAdvice() {
    this.addMoreAdvice = !this.addMoreAdvice;
    this.addAdviceForm.reset();
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

  addAdvice() {
    if (this.addAdviceForm.invalid) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptAdvice,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addAdviceForm.value.advice,
      encounter: this.visitNotePresent.uuid,
    }).subscribe(response => {
      this.advices.push({ uuid: response.uuid, value: this.addAdviceForm.value.advice });
      this.addAdviceForm.reset();
    });
  }

  deleteAdvice(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.advices.splice(index, 1);
    });
  }

  getTestsList() {
    const testUuid = '98c5881f-b214-4597-83d4-509666e9a7c9';
    this.diagnosisService.concept(testUuid).subscribe(res => {
      const result = res.answers;
      result.forEach(ans => {
        this.testsList.push(ans.display);
      });
    });
  }

  toggleTest() {
    this.addMoreTest = !this.addMoreTest;
    this.addTestForm.reset();
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

  addTest() {
    if (this.addTestForm.invalid) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptTest,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: this.addTestForm.value.test,
      encounter: this.visitNotePresent.uuid,
    }).subscribe(response => {
      this.tests.push({ uuid: response.uuid, value: this.addTestForm.value.test });
      this.addTestForm.reset();
    });
  }

  deleteTest(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.tests.splice(index, 1);
    });
  }

  toggleReferral() {
    this.addMoreReferral = !this.addMoreReferral;
    this.addReferralForm.reset();
  }

  checkIfReferralPresent() {
    this.referrals = [];
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptReferral)
    .subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter && obs.encounter.visit.uuid === this.visit.uuid) {
          this.referrals.push({ uuid: obs.uuid, speciality: obs.value.split(':')[0].trim(), remark:  obs.value.split(':')[1].trim() });
        }
      });
    });
  }

  addReferral() {
    if (this.addReferralForm.invalid) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptReferral,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: `${this.addReferralForm.value.speciality}:${this.addReferralForm.value.remark}`,
      encounter: this.visitNotePresent.uuid,
    }).subscribe(response => {
      this.referrals.push({ uuid: response.uuid, speciality: this.addReferralForm.value.speciality, remark: this.addReferralForm.value.remark });
      this.addReferralForm.reset();
    });
  }

  deleteReferral(index: number, uuid: string) {
    this.diagnosisService.deleteObs(uuid).subscribe(() => {
      this.referrals.splice(index, 1);
    });
  }

  checkIfFollowUpPresent() {
    this.diagnosisService.getObs(this.visit.patient.uuid, this.conceptFollow).subscribe((response: any) => {
      response.results.forEach((obs: any) => {
        if (obs.encounter.visit.uuid === this.visit.uuid) {
          let followUpDate = moment(obs.value.split(', Remark: ')[0].replaceAll('-','/'),'DD/MM/YYYY').format('YYYY-MM-DD');
          let followUpReason = (obs.value.split(', Remark: ')[1])? obs.value.split(', Remark: ')[1] : null ;
          this.followUpForm.patchValue({
            present: true,
            wantFollowUp: 'Yes',
            followUpDate,
            followUpReason
          });
        }
      });
    });
  }

  saveFollowUp() {
    if (this.followUpForm.invalid || !this.isVisitNoteProvider) {
      return;
    }
    this.encounterService.postObs({
      concept: this.conceptFollow,
      person: this.visit.patient.uuid,
      obsDatetime: new Date(),
      value: (this.followUpForm.value.followUpReason) ? `${this.followUpForm.value.followUpDate}, Remark: ${this.followUpForm.value.followUpReason}`: this.followUpForm.value.followUpDate,
      encounter: this.visitNotePresent.uuid
    }).subscribe((res: any) => {
      if (res) {
        this.followUpForm.patchValue({ present: true });
      }
    });
  }

  sharePrescription() {
    this.coreService.openSharePrescriptionConfirmModal().subscribe((res: any) =>{
      if (res) {
        if (this.isVisitNoteProvider) {
          if (this.provider.attributes.length) {
            if (navigator.onLine) {
              this.encounterService.postEncounter({
                patient: this.visit.patient.uuid,
                encounterType: "bd1fbfaa-f5fb-4ebd-b75c-564506fc309e", //visit complete encounter type uuid
                encounterProviders: [
                  {
                    provider: this.provider.uuid,
                    encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03", // Doctor encounter role
                  },
                ],
                visit: this.visit.uuid,
                encounterDatetime: new Date(Date.now() - 30000),
                obs: [
                  {
                    concept: "7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e", // Doctor details concept uuid
                    value: JSON.stringify(this.getDoctorDetails()),
                  },
                ]
              }).subscribe((post) => {
                this.visitCompleted = true;
                this.coreService.openSharePrescriptionSuccessModal().subscribe((result: any) => {
                  if (result == 'view') {
                    // Open visit summary modal here....

                  } else if(result == 'dashboard') {
                    this.router.navigate(['/dashboard']);
                  }
                });
              });
            } else {
              this.coreService.openSharePrescriptionErrorModal({ msg:'Unable to send prescription due to poor network connection. Please try again or come back later', confirmBtnText: 'Try again'}).subscribe((c: any) =>{
                if (c) {

                }
              });
            }

          } else {
            this.coreService.openSharePrescriptionErrorModal({ msg:'Unable to send prescription since your profile is not complete.', confirmBtnText: 'Go to profile'}).subscribe((c: any) =>{
              if (c) {
                this.router.navigate(['/dashboard/profile']);
              }
            });
          }
        } else {
          this.coreService.openSharePrescriptionErrorModal({ msg: 'Unable to send prescription since this visit already in progress with another doctor.', confirmBtnText: 'Go to dashboard'}).subscribe((c: any) =>{
            if (c) {
              this.router.navigate(['/dashboard']);
            }
          });
        }
      }
    });
  }

  getDoctorDetails() {
    let d: any = {};
    let attrs: string[] = [
      'qualification',
      'fontOfSign',
      'whatsapp',
      'registrationNumber',
      'consultationLanguage',
      'typeOfProfession',
      'address',
      'workExperience',
      'researchExperience',
      'textOfSign',
      'specialization',
      'phoneNumber',
      'countryCode',
      'emailId',
      'workExperienceDetails',
      'signatureType',
      'signature'
    ];
    d.name = this.provider.person.display;
    d.uuid = this.provider.uuid;
    attrs.forEach((attr: any) => {
      this.provider.attributes.forEach((pattr: any) => {
        if (pattr.attributeType.display == attr && !pattr.voided) {
          d[attr] = pattr.value;
          return;
        }
      });
    });
    return d;
  }

  getPastVisitHistory() {
    this.visitService.recentVisits(this.visit.patient.uuid).subscribe((res: any) => {
      let visits = res.results;
      if (visits.length > 1) {
        visits.forEach((visit: any) => {
          if (visit.uuid !== this.visit.uuid) {
            this.visitService.fetchVisitDetails(visit.uuid).subscribe((visitdetail: any) =>{
              visitdetail.created_on = visitdetail.startDatetime;
              visitdetail.cheif_complaint = this.getCheifComplaint(visitdetail);
              visitdetail.encounters.forEach((encounter: any) => {
                if (encounter.encounterType.display == 'Visit Complete') {
                  visitdetail.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                  encounter.obs.forEach((o: any) => {
                    if (o.concept.display == 'Doctor details') {
                      visitdetail.doctor = JSON.parse(o.value);
                    }
                  });
                  encounter.encounterProviders.forEach((p: any) => {
                    visitdetail.doctor.gender = p.provider.person.gender;
                    visitdetail.doctor.person_uuid = p.provider.person.uuid;
                  });
                }
              });
              this.pastVisits.push(visitdetail);
            });
          }
        });
        this.dataSource = new MatTableDataSource(this.pastVisits);
      }
    });
  }

  getCheifComplaint(visit: any) {
    let recent: any = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.display;
      if (display.match('ADULTINITIAL') !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.display.match('CURRENT COMPLAINT') !== null) {
            const currentComplaint = currentObs.display.split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match('Associated symptoms')) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  openVisitSummaryModal(uuid: string) {
    this.coreService.openVisitSummaryModal({uuid});
  }

  openVisitPrescriptionModal(uuid: string) {
    this.coreService.openVisitPrescriptionModal({uuid});
  }

  ngOnDestroy(): void {
    localStorage.removeItem('patientVisitProvider');
  }

}
