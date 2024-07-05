import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { UntypedFormGroup, UntypedFormControl, Validators } from "@angular/forms";
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
import { TranslationService } from "src/app/services/translation.service";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";
import { Observable, Subscription } from "rxjs";
declare var getFromStorage: any, getEncounterUUID: any, getFromStorage: any;

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
export class PatientInteractionComponent implements OnInit, OnDestroy {
  @Input() isManagerRole: boolean;
  @Input() visitCompleted: boolean;
  msg: any = [];
  tempmsg: any = [];
  whatsappLink: string;
  phoneNo;
  patientDetails: any;
  doctorDetails: any = {};
  conceptAdvice = "67a050c1-35e5-451c-a4ab-fff9d57b0db1";
  encounterUuid: string;
  patientId: string;
  visitId: string;
  adviceObs: any = [];

  interaction = new UntypedFormGroup({
    interaction: new UntypedFormControl("", [Validators.required]),
  });

  private eventsSubscription: Subscription;
  @Input() events: Observable<void>;
  @Output() editedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private diagnosisService: DiagnosisService,
    private visitService: VisitService,
    private route: ActivatedRoute,
    private encounterService: EncounterService,
    private translationService: TranslationService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.visitId = this.route.snapshot.params["visit_id"];
    this.patientId = this.route.snapshot.params["patient_id"];
    this.fetchVisitDetails();
    this.getAttributes();
    this.getAdviceObs();
    this.eventsSubscription = this.events?.subscribe(() => this.submit());
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

  getAttributes() {
    this.visitService.getAttribute(this.visitId).subscribe((response) => {
      const result = response.results;
      var tempMsg = result.filter((pType) =>
        pType.display.includes('Patient Interaction')
      );
      let data = this.diagnosisService.getData(tempMsg[0])
      if (data) {
        this.msg.push(data);
      }
    });
  }

  getAdviceObs() {
    this.diagnosisService
      .getObs(this.patientId, this.conceptAdvice)
      .subscribe(({ results }) => {
        results.forEach(obs => {
          if (obs.value.includes('Start') && obs.encounter.visit.uuid === this.visitId) {
            this.adviceObs.push(this.diagnosisService.getData(obs));
          }
        });
      });
  }

  tempSave() {
    this.diagnosisService.getTranslationData();
    if (this.diagnosisService.isEncounterProvider()) {
      const formValue = this.interaction.value;
      const value = formValue.interaction;
      
      this.tempmsg.push(this.diagnosisService.getData({ value: value }));
      this.editedEvent.emit(true);
      this.interaction.reset();
    } else {
      this.translationService.getTranslation("Another doctor is viewing this case");
    }
  }

  submit() {
    const visitId = this.route.snapshot.params["visit_id"];
    // const formValue = this.interaction.value;
    // const value = formValue.interaction;
    if(!this.tempmsg.length){
      return;
    }
    const value = this.tempmsg[0].value;
    const providerDetails = getFromStorage("provider");
    this.diagnosisService.getTranslationData();
    if (this.diagnosisService.isEncounterProvider()) {
      const json = {
        attributeType: "6cc0bdfe-ccde-46b4-b5ff-e3ae238272cc",
        value: this.getBody(value),
      };
      this.visitService.postAttribute(visitId, json).subscribe((response1) => {
        let obj = {
          uuid: response1.uuid,
          value: json.value
        }
        this.msg.push(this.diagnosisService.getData(obj));
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

          setTimeout(() => {
            this.tempmsg = [];
          }, 500);
        }
      }
    } else {
      this.translationService.getTranslation("Another doctor is viewing this case");
    }
  }

  delete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      this.visitService.deleteAttribute(this.visitId, i).subscribe(() => {
        this.msg = [];
      });
      if (this.adviceObs.length > 0) {
        this.adviceObs.forEach(({ uuid }) => {
          this.diagnosisService.deleteObs(uuid).subscribe();
        });
      }
    }
  }

  tempdelete(i) {
    if (this.diagnosisService.isEncounterProvider()) {
      this.tempmsg = [];
    }
  }

  getBody(value) {
    let value1;
    if (localStorage.getItem('selectedLanguage') === 'ar') {
      value1 = {
        "ar": value,
        "en": this.diagnosisService.values[value],
      }
    } else {
      value1 = {
        "ar": this.diagnosisService.values[value],
        "en": value,
      }
    }
    return JSON.stringify(value1);
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  ngOnDestroy() {
    this.eventsSubscription?.unsubscribe();
  }

  unSaveChanges() {
    return this.tempmsg.length > 0;
  }
}
