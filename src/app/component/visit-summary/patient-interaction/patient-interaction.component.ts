// import { Component, OnInit } from "@angular/core";
// import { FormGroup, FormControl, Validators } from "@angular/forms";
// import { VisitService } from "src/app/services/visit.service";
// import { EncounterService } from "src/app/services/encounter.service";
// import { DiagnosisService } from "src/app/services/diagnosis.service";
// import { ActivatedRoute } from "@angular/router";
// import {
//   transition,
//   trigger,
//   style,
//   animate,
//   keyframes,
// } from "@angular/animations";
// import { MatSnackBar } from "@angular/material/snack-bar";
// declare var getEncounterProviderUUID: any,
//   getFromStorage: any,
//   getEncounterUUID: any;

// @Component({
//   selector: 'app-patient-interaction',
//   templateUrl: './patient-interaction.component.html',
//   styleUrls: ['./patient-interaction.component.css'],
//   animations: [
//     trigger('moveInLeft', [
//       transition('void=> *', [style({ transform: 'translateX(300px)' }),
//       animate(200, keyframes([
//         style({ transform: 'translateX(300px)' }),
//         style({ transform: 'translateX(0)' })
//       ]))]),
//       transition('*=>void', [style({ transform: 'translateX(0px)' }),
//       animate(100, keyframes([
//         style({ transform: 'translateX(0px)' }),
//         style({ transform: 'translateX(300px)' })
//       ]))])
//     ])
//   ]
// })
// export class PatientInteractionComponent implements OnInit {
//   msg: any = [];
//   whatsappLink: string;
//   phoneNo;
//   patientDetails: any;
//   doctorDetails: any = {};
//   conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
//   encounterUuid: string;

//   interaction = new FormGroup({
//     interaction: new FormControl('', [Validators.required])
//   });
//   constructor(
//     private diagnosisService: DiagnosisService,
//     private visitService: VisitService,
//     private snackbar: MatSnackBar,
//     private route: ActivatedRoute,
//     private encounterService: EncounterService) { }

//   ngOnInit() {
//     const visitId = this.route.snapshot.params['visit_id'];
//     this.visitService.fetchVisitDetails(visitId)
//       .subscribe(visitDetails => {
//         this.patientDetails = visitDetails.patient;
//         visitDetails.encounters.forEach(encounter => {
//           if (encounter.display.match('ADULTINITIAL') != null) {
//             const providerAttribute = encounter.encounterProviders[0].provider.attributes;
//             if (providerAttribute.length) {
//               providerAttribute.forEach(attribute => {
//                 if (attribute.display.match('phoneNumber') != null) {
//                   this.phoneNo = attribute.value;
//                 }
//                 if (attribute.display.match('whatsapp') != null) {
//                   const whatsapp = attribute.value;
//                   // tslint:disable-next-line: max-line-length
//                   const text = encodeURI(`Hello I'm calling for patient ${this.patientDetails.person.display} OpenMRS ID ${this.patientDetails.identifiers[0].identifier}`);
//                   this.whatsappLink = `https://wa.me/91${whatsapp}?text=${text}`;
//                   console.log(' this.whatsappLink: ',  this.whatsappLink);
//                 }
//               });
//             }
//           }
//         });
//       });
//     this.visitService.getAttribute(visitId)
//       .subscribe(response => {
//         const result = response.results;
//         var tempMsg =result.filter(pType => ['Yes', 'No'].includes(pType.value) );        
//         if (result.length !== 0) {
//         this.msg = tempMsg;
//         // this.msg.push({ uuid: tempMsg[0].uuid, value: tempMsg[0].value });
//         }
//       });
//   }

//   submit() {
//     const visitId = this.route.snapshot.params['visit_id'];
//     const formValue = this.interaction.value;
//     const value = formValue.interaction;
//     const providerDetails = getFromStorage('provider');
//     const providerUuid = providerDetails.uuid;
//     if (providerDetails && providerUuid === getEncounterProviderUUID()) {
//       this.visitService.getAttribute(visitId)
//         .subscribe(response => {
//           const result = response.results;
//           if (result.length !== 0 && ['Yes', 'No'].includes(response.value))  {
//           } else {
//             const json = {
//               'attributeType': '6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc',
//               'value': value
//             };
//             this.visitService.postAttribute(visitId, json)
//               .subscribe(response1 => {
//                   this.msg.push({ uuid: response1.uuid, value: response1.value });
//               });
//           }
//         });
//       this.encounterUuid = getEncounterUUID();
//       const attributes = providerDetails.attributes;
//       this.doctorDetails.name = providerDetails.person.display;
//       if (attributes.length) {
//         attributes.forEach(attribute => {
//           if (attribute.display.match('phoneNumber') != null) {
//             this.doctorDetails.phone = `<a href="tel:${attribute.value}">Start Audio Call with ${this.doctorDetails.name} </a>`;
//           }
//           if (attribute.display.match('whatsapp') != null) {
//             // tslint:disable-next-line: max-line-length
//             this.doctorDetails.whatsapp = `<a href="https://wa.me/91${attribute.value}">Start WhatsApp Call ${this.doctorDetails.name}</a>`;
//           }
//         });
//         if (this.doctorDetails.phone || this.doctorDetails.whatsapp) {
//           if (this.doctorDetails.phone && this.doctorDetails.whatsapp) {
//             this.doctorDetails.html = `${this.doctorDetails.phone}<br>${this.doctorDetails.whatsapp}`;
//           } else if (this.doctorDetails.phone) {
//             this.doctorDetails.html = `${this.doctorDetails.phone}`;
//           } else if (this.doctorDetails.whatsapp) {
//             this.doctorDetails.html = `${this.doctorDetails.whatsapp}`;
//           }
//           const date = new Date();
//           const json = {
//             concept: this.conceptAdvice,
//             person: this.route.snapshot.params['patient_id'],
//             obsDatetime: date,
//             value: this.doctorDetails.html,
//             encounter: this.encounterUuid
//           };
//           this.encounterService.postObs(json).subscribe((response) => {
//             this.diagnosisService.isVisitSummaryChanged = true;
//           });
//         }
//       }
//     } else { this.snackbar.open('Another doctor is viewing this case', null, { duration: 4000 }); }
//   }

//   delete(i) {
//     const visitId = this.route.snapshot.params['visit_id'];
//     this.visitService.deleteAttribute(visitId, i)
//       .subscribe(res => {
//         this.msg = [];
//       });
//   }
// }

import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { VisitService } from "src/app/services/visit.service";
import { EncounterService } from "src/app/services/encounter.service";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { ActivatedRoute } from "@angular/router";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
import { MatSnackBar } from "@angular/material/snack-bar";
declare var getEncounterProviderUUID: any,
  getFromStorage: any,
  getEncounterUUID: any;

@Component({
  selector: "app-patient-interaction",
  templateUrl: "./patient-interaction.component.html",
  styleUrls: ["./patient-interaction.component.css"],
  animations: [
    trigger("moveInLeft", [
      transition("void=> *", [
        style({ transform: "translateX(300px)" }),
        animate(
          200,
          keyframes([
            style({ transform: "translateX(300px)" }),
            style({ transform: "translateX(0)" }),
          ])
        ),
      ]),
      transition("*=>void", [
        style({ transform: "translateX(0px)" }),
        animate(
          100,
          keyframes([
            style({ transform: "translateX(0px)" }),
            style({ transform: "translateX(300px)" }),
          ])
        ),
      ]),
    ]),
  ],
})
export class PatientInteractionComponent implements OnInit {
  msg: any = [];
  whatsappLink: string;
  phoneNo;
  patientDetails: any;
  doctorDetails: any = {};
  conceptAdvice = "67a050c1-35e5-451c-a4ab-fff9d57b0db1";
  encounterUuid: string;

  interaction = new FormGroup({
    interaction: new FormControl("", [Validators.required]),
  });
  constructor(
    private diagnosisService: DiagnosisService,
    private visitService: VisitService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private encounterService: EncounterService
  ) {}

  ngOnInit() {
    const visitId = this.route.snapshot.params["visit_id"];
    this.visitService.fetchVisitDetails(visitId).subscribe((visitDetails) => {
      this.patientDetails = visitDetails.patient;
      visitDetails.encounters.forEach((encounter) => {
        if (encounter.display.match("ADULTINITIAL") != null) {
          const providerAttribute =
            encounter.encounterProviders[0].provider.attributes;
          if (providerAttribute.length) {
            providerAttribute.forEach((attribute) => {
              if (attribute.display.match("phoneNumber") != null) {
                this.phoneNo = attribute.value;
              }
              if (attribute.display.match("whatsapp") != null) {
                const whatsapp = attribute.value;
                // tslint:disable-next-line: max-line-length
                const text = encodeURI(
                  `Hello I'm calling for patient ${this.patientDetails.person.display} OpenMRS ID ${this.patientDetails.identifiers[0].identifier}`
                );
                this.whatsappLink = `https://wa.me/91${whatsapp}?text=${text}`;
              }
            });
          }
        }
      });
    });
    this.visitService.getAttribute(visitId).subscribe((response) => {
      const result = response.results;
      var tempMsg = result.filter((pType) =>
        ["Yes", "No"].includes(pType.value)
      );
      if (result.length !== 0) {
        this.msg = tempMsg;
        // this.msg.push({ uuid: tempMsg[0].uuid, value: tempMsg[0].value });
      }
    });
  }

  submit() {
    const visitId = this.route.snapshot.params["visit_id"];
    const formValue = this.interaction.value;
    const value = formValue.interaction;
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    if (providerDetails && providerUuid === getEncounterProviderUUID()) {
      this.visitService.getAttribute(visitId).subscribe((response) => {
        const result = response.results;
        if (result.length !== 0 && ["Yes", "No"].includes(response.value)) {
        } else {
          const json = {
            attributeType: "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc",
            value: value,
          };
          this.visitService
            .postAttribute(visitId, json)
            .subscribe((response1) => {
              this.msg.push({ uuid: response1.uuid, value: response1.value });
            });
        }
      });
      this.encounterUuid = getEncounterUUID();
      const attributes = providerDetails.attributes;
      this.doctorDetails.name = providerDetails.person.display;
      if (attributes.length) {
        attributes.forEach((attribute) => {
          if (attribute.display.match("phoneNumber") != null) {
            this.doctorDetails.phone = `<a href="tel:${attribute.value}">Start Audio Call with ${this.doctorDetails.name} </a>`;
          }
          if (attribute.display.match("whatsapp") != null) {
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
            person: this.route.snapshot.params["patient_id"],
            obsDatetime: date,
            value: this.doctorDetails.html,
            encounter: this.encounterUuid,
          };
          this.encounterService.postObs(json).subscribe((response) => {
            this.diagnosisService.isVisitSummaryChanged = true;
          });
        }
      }
    } else {
      this.snackbar.open("Another doctor is viewing this case", null, {
        duration: 4000,
      });
    }
  }

  delete(i) {
    const visitId = this.route.snapshot.params["visit_id"];
    this.visitService.deleteAttribute(visitId, i).subscribe((res) => {
      this.msg = [];
    });
  }
}