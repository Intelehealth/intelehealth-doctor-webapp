import { Component, Input, OnInit } from "@angular/core";
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
import { DiagnosisService } from "src/app/services/diagnosis.service";
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
  @Input() isManagerRole: boolean;
  msg: any = [];
  interactionType = '';
  comment = null;
  interactionForm: FormGroup;
  whatsappLink: string;
  phoneNo;
  patientDetails: any;
  doctorDetails: any = {};
  conceptAdvice = "67a050c1-35e5-451c-a4ab-fff9d57b0db1";
  encounterUuid: string;
  patientId: string;
  visitId: string;
  adviceObs: any = [];
  isCommentAdded: boolean = false;

  constructor(
    private diagnosisService: DiagnosisService,
    private visitService: VisitService,
    private route: ActivatedRoute,
    private encounterService: EncounterService
  ) {
    this.interactionForm = new FormGroup({
      interaction: new FormControl("", [Validators.required]),
      comment: new FormControl("")
    });

  }

  ngOnInit() {
    this.visitId = this.route.snapshot.params["visit_id"];
    this.patientId = this.route.snapshot.params["patient_id"];
    this.fetchVisitDetails();
    this.getAttributes();
    this.getAdviceObs();
  }
  fetchVisitDetails() {
    this.visitService
      .fetchVisitDetails(this.visitId)
      .subscribe((visitDetails) => {
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
  }

  setCommentAddedFlag() {
    if (this.interactionForm.value.comment.trim().length > 0) {
      this.isCommentAdded = false;
    } else {
      this.isCommentAdded = true;
    }
  }

  getAttributes() {
    this.visitService.getAttribute(this.visitId).subscribe((response) => {
      const result = response.results;
      var tempMsg = result.filter((pType) =>
        pType.display.includes("Patient Interaction")
      );
      if (tempMsg.length !== 0) {
        this.msg = tempMsg;
        if (this.msg[0]?.value === 'Yes') {
          this.interactionType = 'Spoke with the patient directly';
        } else if (this.msg[0]?.value === 'No') {
          this.interactionType = 'None';
        } else {
          this.interactionType = this.msg[0]?.value.includes(",") ? this.msg[0].value.split(",")[0] : this.msg[0].value;
        }
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

  clearComment() {
    this.comment = null;
  }

  submit() {
    const visitId = this.route.snapshot.params["visit_id"];
    const formValue = this.interactionForm.value;
    const providerDetails = getFromStorage("provider");
    if (this.diagnosisService.isSameDoctor()) {
      const json = {
        attributeType: "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc",
        value: formValue.comment?.trim().length > 0 ? `${formValue.interaction}, Comment: ${formValue.comment}` : formValue.interaction,
      };
      this.visitService
        .postAttribute(visitId, json)
        .subscribe((response1) => {
          this.msg.push({ uuid: response1.uuid, value: response1.value });
          this.clearComment();
        });
      this.encounterUuid = getEncounterUUID();
      const attributes = providerDetails.attributes;
      this.doctorDetails.name = providerDetails.person.display;
      if (attributes.length) {
        attributes.forEach((attribute) => {
          if (attribute.display.match("phoneNumber") != null) {
            this.doctorDetails.phone = `<a href="tel:${attribute.value}">Start Audio Call with Doctor_</a>`;
          }
          if (attribute.display.match("whatsapp") != null) {
            // tslint:disable-next-line: max-line-length
            this.doctorDetails.whatsapp = `<a href="https://wa.me/91${attribute.value}">Start WhatsApp Call with Doctor_</a>`;
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
            this.getAdviceObs();
          });
        }
      }
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      this.visitService.deleteAttribute(this.visitId, i).subscribe(() => {
        this.msg = [];
        this.interactionType = '';
      });
      if (this.adviceObs.length > 0) {
        this.adviceObs.forEach(({ uuid }) => {
          this.diagnosisService.deleteObs(uuid).subscribe();
        });
      }
    }
  }
}