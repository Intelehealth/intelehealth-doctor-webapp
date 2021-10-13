import { Component, OnInit } from "@angular/core";
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
  msg: any = [];
  whatsappLink: string;
  telegramLink: string;
  phoneNo;
  whatsappNo;
  countryCode = "996"
  patientDetails: any;
  doctorDetails: any = {};
  conceptAdvice = "67a050c1-35e5-451c-a4ab-fff9d57b0db1";
  encounterUuid: string;
  patientId: string;
  visitId: string;
  adviceObs: any = [];
  countries=[
    "Kyrgyzstan",
    "India"
  ]
  interaction = new FormGroup({
    interaction: new FormControl("", [Validators.required]),
    country: new FormControl("Kyrgyzstan")
  });
  constructor(
    private diagnosisService: DiagnosisService,
    private visitService: VisitService,
    private route: ActivatedRoute,
    private encounterService: EncounterService
  ) {}

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
                 this.whatsappNo = attribute.value;
                  this.setLinks();
                }
              });
            }
          }
        });
      });
  }

  setLinks() {
    // tslint:disable-next-line: max-line-length
    const text = encodeURI(
      `Hello I'm calling for patient ${this.patientDetails.person.display} OpenMRS ID ${this.patientDetails.identifiers[0].identifier}`
    );
    this.countryCode = this.interaction.value.country === "India" ? "91":"996";
    this.whatsappLink = `https://wa.me/${this.countryCode}${this.whatsappNo}?text=${text}`;
    this.telegramLink = `https://telegram.me/share/url?phone=${this.countryCode}${this.whatsappNo}&url=${text}`;
  }

  getAttributes() {
    this.visitService.getAttribute(this.visitId).subscribe((response) => {
      const result = response.results;
      var tempMsg = result.filter((pType) =>
        ["Yes", "No", "да", "Нет"].includes(pType.value)
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
      this.visitService.deleteAttribute(this.visitId, i).subscribe((res) => {
        this.msg = [];
      });
      if (this.adviceObs.length > 0) {
        this.adviceObs.forEach(({ uuid }) => {
          this.diagnosisService.deleteObs(uuid).subscribe();
        });
      }
    }
  }
}