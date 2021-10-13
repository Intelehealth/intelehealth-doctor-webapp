import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { VisitService } from "src/app/services/visit.service";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute } from "@angular/router";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { ConfirmDialogService } from "../confirm-dialog/confirm-dialog.service";
declare var getFromStorage: any,
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
  @Output() isDataPresent = new EventEmitter<boolean>();
  msg: any = [];
  whatsappLink: string;
  phoneNo;
  patientDetails: any;
  doctorDetails: any = {};
  conceptAdvice = "67a050c1-35e5-451c-a4ab-fff9d57b0db1";
  encounterUuid: string;
  patientId: string;
  visitId: string;
  adviceObs: any = [];

  interaction = new FormGroup({
    interaction: new FormControl("", [Validators.required]),
  });
  constructor(
    private diagnosisService: DiagnosisService,
    private visitService: VisitService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private encounterService: EncounterService,
    private confirmDialogService: ConfirmDialogService,
  ) { }

  ngOnInit() {
    this.visitId = this.route.snapshot.params["visit_id"];
    this.patientId = this.route.snapshot.params["patient_id"];
    this.fetchVisitDetails();
    this.getAttributes();
    this.getAdviceObs();
  }

  fetchVisitDetails() {
    this.visitService.patientInfo(this.patientId)
      .subscribe(info => {
        info.person['attributes'].forEach(attri => {
          if (attri.attributeType.display.match('Telephone Number')) {
            info['telephone'] = attri.value;
          }
        });
        if (info['telephone'] != null) {
          this.phoneNo = info['telephone'];
          const whatsapp = info['telephone'];
          // tslint:disable-next-line: max-line-length
          const text = encodeURI(
            `Hello I'm calling for patient ${info.person.display} OpenMRS ID ${info.identifiers[0].identifier}`);
          this.whatsappLink = `https://wa.me/91${whatsapp}?text=${text}`;
        }
      });
  }

  getAttributes() {
    this.visitService.getAttribute(this.visitId).subscribe((response) => {
      const result = response.results;
      var tempMsg = result.filter((pType) =>
        ["Yes", "No"].includes(pType.value)
      );
      if (result.length !== 0) {
        this.msg = tempMsg;
      }
    });
  }

  getAdviceObs() {
    this.diagnosisService
      .getObs(this.patientId, this.conceptAdvice)
      .subscribe(({ results }) => {
        this.adviceObs = results;
      });
  }

  submit() {
    const visitId = this.route.snapshot.params["visit_id"];
    const formValue = this.interaction.value;
    const value = formValue.interaction;
    const providerDetails = getFromStorage("provider");
    if (this.diagnosisService.isSameDoctor()) {
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
              this.isDataPresent.emit(true);
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
            this.getAdviceObs();
          });
        }
      }
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      this.visitService.deleteAttribute(this.visitId, i).subscribe((res) => {
        this.msg = [];
        this.isDataPresent.emit(false);
      });
      if (this.adviceObs.length > 0) {
        this.adviceObs.forEach(({ uuid }) => {
          this.diagnosisService.deleteObs(uuid).subscribe();
        });
        if (this.adviceObs.length > 0) {
          this.adviceObs.forEach(({ uuid }) => {
            this.diagnosisService.deleteObs(uuid).subscribe();
          });
        }
      }
    }
  }

  startCall(patientMobileNo) {
    const providerDetails = getFromStorage('provider');
    let doctorsMobileNo: string;
    providerDetails.attributes.forEach(attribute => {
      if (attribute.display.match('phoneNumber') != null) {
        doctorsMobileNo = attribute.value;
      }
    });
    if (doctorsMobileNo) {
      this.visitService.startCall(patientMobileNo, doctorsMobileNo)
        .subscribe(() => {
          this.openDialog("Calling to patient")
        }, () => {
          this.openDialog("Unable to connect this call, please try again")
        });
    } else {
      this.snackbar.open('To perform call, please update your phone no in MyAccount section', null, { duration: 4000 });
    }
  }

  openDialog(msg: string) {
    this.confirmDialogService.openConfirmDialog(msg, true)
      .afterClosed().subscribe();
  }

}