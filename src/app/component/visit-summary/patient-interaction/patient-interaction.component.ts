import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { VisitService } from 'src/app/services/visit.service';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any;

@Component({
  selector: 'app-patient-interaction',
  templateUrl: './patient-interaction.component.html',
  styleUrls: ['./patient-interaction.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ]
})
export class PatientInteractionComponent implements OnInit {
  msg: any = [];
  phoneNo: any = 999999999;
  patientDetails: any;
  doctorDetails: any = {};
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  encounterUuid: string;
  visitUuid: string;
  patientId: string;
  conceptLeftEyeDiagnosis: String = '1796244d-e936-4ab8-ac8a-c9bcfa476570';
  conceptRightEyeDiagnosis: String = '58cae684-1509-4fd5-b256-5ca980ec6bb4';
  ReferralLocationConcept: String = '56ed8dca-a028-4108-b42e-6f9fab6f5d9e';
  referralLocation: any = [];
  leftDiagnosis: any = [];
  rightDiagnosis: any = [];
  patientInfo: any;

  interaction = new UntypedFormGroup({
    interaction: new UntypedFormControl('', [Validators.required])
  });
  constructor(private visitService: VisitService,
    private diagnosisService: DiagnosisService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private encounterService: EncounterService) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.params['visit_id'];
    this.patientId = this.route.snapshot.paramMap.get('patient_id');
    // this.visitService.fetchVisitDetails(this.visitUuid)
    //   .subscribe(visitDetails => {
    //     this.patientDetails = visitDetails.patient;
    //     console.log(this.patientDetails)
    //     visitDetails.encounters.forEach(encounter => {
    //       if (encounter.display.match('ADULTINITIAL') != null) {
    //         const providerAttribute = encounter.encounterProviders[0].provider.attributes;
    //         if (providerAttribute.length) {
    //           providerAttribute.forEach(attribute => {
    //             if (attribute.display.match('phoneNumber') != null) {
    //               this.phoneNo = attribute.value;
    //             }
    //             if (attribute.display.match('whatsapp') != null) {
    //               const whatsapp = attribute.value;
    //               // tslint:disable-next-line: max-line-length
    // tslint:disable-next-line: max-line-length
    //               const text = encodeURI(`Hello I'm calling for patient ${this.patientDetails.person.display} OpenMRS ID ${this.patientDetails.identifiers[0].identifier}`);
    //               this.whatsappLink = `https://wa.me/91${whatsapp}?text=${text}`;
    //             }
    //           });
    //         }
    //       }
    //     });
    //   });
    this.visitService.patientInfo(this.patientId)
    .subscribe(info => {
      this.patientInfo = info;
      info.person['attributes'].forEach(attri => {
        if (!attri.attributeType.display.match('Telephone Number')) {
          // this.phoneNo = attri.value;
        }
      });
    });
    this.visitService.getAttribute(this.visitUuid)
      .subscribe(response => {
        const result = response.results;
        if (result.length !== 0) {
          this.msg.push({ uuid: result[0].uuid, value: result[0].value });
        }
      });
  }

  getWhatsApp = () => {
    this.leftDiagnosis = [];
    this.rightDiagnosis = [];
    let leftEye = '', rightEye = '', flag = 0, createMsg = false;
    [
      {concept: this.conceptLeftEyeDiagnosis, name: 'leftDiagnosis'},
      {concept: this.conceptRightEyeDiagnosis, name: 'rightDiagnosis'},
      {concept: this.ReferralLocationConcept, name: 'referralLocation'}
    ].forEach((each) => {
      this.diagnosisService.getObs(this.patientId, each.concept)
      .subscribe(response => {
        flag++;
        response.results.forEach((obs, index) => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this[each.name].push(obs);
            if (flag === 2 && index + 1 === response.results.length) {
              createMsg = true;
            }
          }
          if (flag === 3 && createMsg) {
            // tslint:disable-next-line: max-line-length
            for (let j = 0; j < this.rightDiagnosis.length; j++) {
              rightEye += `${this.rightDiagnosis[j].value}${this.rightDiagnosis.length !== j + 1 ? ', ' : ''}`;
            }
            for (let i = 0; i < this.leftDiagnosis.length; i++) {
              leftEye += `${this.leftDiagnosis[i].value}${this.leftDiagnosis.length !==  i + 1 ? ', ' : ''}`;
            }
            setTimeout(() => {
              const text = `An ophthalmologist from Aravind Eye Hospital has reviewed ${this.patientInfo.person.display}’s visit on ${new Date().toLocaleDateString()}. The result of the screening is
              %0aRight Eye: ${rightEye ? rightEye : ''}
              %0aLeft Eye: ${leftEye ? leftEye : ''}
              %0a
              ${this.referralLocation.length ?
              `%0aIt is recommended that ${this.patientInfo.person.display} come to the nearest ${this.referralLocation[0].value} to receive free additional testing and treatment.` : ''}
              %0a
              %0aFor questions, please call: (0413) 261 9100`;
              window.open(`https://wa.me/91${this.phoneNo}?text=${text}`, '_blank');
            }, 1000);
          }
        });
      });
    });
  }

  submit() {
    const formValue = this.interaction.value;
    const value = formValue.interaction;
    const providerDetails = getFromStorage('provider');
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.visitService.getAttribute(this.visitUuid)
        .subscribe(response => {
          const result = response.results;
          if (result.length !== 0) {
          } else {
            const json = {
              'attributeType': '6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc',
              'value': value
            };
            this.visitService.postAttribute(this.visitUuid, json)
              .subscribe(response1 => {
                this.msg.push({ uuid: response1.uuid, value: response1.value });
              });
          }
        });
      this.encounterUuid = getEncounterUUID;
      const attributes = providerDetails.attributes;
      this.doctorDetails.name = providerDetails.person.display;
      if (attributes.length) {
        attributes.forEach(attribute => {
          if (attribute.display.match('phoneNumber') != null) {
            this.doctorDetails.phone = `<a href="tel:${attribute.value}">Start Audio Call with ${this.doctorDetails.name} </a>`;
          }
          if (attribute.display.match('whatsapp') != null) {
            // tslint:disable-next-line: max-line-length
            this.doctorDetails.whatsapp = `<a href="https://wa.me/91${attribute.value}">Start WhatsApp Call ${this.doctorDetails.name}</a>`;
          }
        });
        if (this.doctorDetails.phone || this.doctorDetails.whatsapp) {
          if (this.doctorDetails.phone && this.doctorDetails.whatsapp) {
            this.doctorDetails.html = `${this.doctorDetails.phone}<br>${this.doctorDetails.whatsapp}`;
          } else if (this.doctorDetails.phone) {
            this.doctorDetails.html = `${this.doctorDetails.phone}`;
          } else if (this.doctorDetails.whatsapp) {
            this.doctorDetails.html = `${this.doctorDetails.whatsapp}`;
          }
          const date = new Date();
          const json = {
            concept: this.conceptAdvice,
            person: this.route.snapshot.params['patient_id'],
            obsDatetime: date,
            value: this.doctorDetails.html,
            encounter: this.encounterUuid
          };
          this.encounterService.postObs(json)
            .subscribe(response => { });
        }
      }
    } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
  }

  delete(i) {
    this.visitService.deleteAttribute(this.visitUuid, i)
      .subscribe(res => {
        this.msg = [];
      });
  }
}
