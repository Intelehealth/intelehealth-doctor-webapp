import { GlobalConstants } from "../../js/global-constants";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { SocketService } from "src/app/services/socket.service";
import { TranslationService } from "src/app/services/translation.service";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
  gender: string;
  age: string;
  location: string;
  status: string;
  lastSeen: string;
  visitId: string;
  patientId: string;
  provider: string;
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
})
export class HomepageComponent implements OnInit, OnDestroy {
  value: any = {};
  activePatient = 0;
  flagPatientNo = 0;
  visitNoteNo = 0;
  remotePatientNo = 0;
  completeVisitNo = 0;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  remoteVisits: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  specialization;
  hostpitalType;
  systemAccess: boolean = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private socket: SocketService,
    private translationService: TranslationService
  ) { }

  ngOnInit() {
    if (getFromStorage("visitNoteProvider")) {
      deleteFromStorage("visitNoteProvider");
    }
    const userDetails = getFromStorage("user");
    if (userDetails) {
      this.sessionService.provider(userDetails.uuid).subscribe((provider) => {
        saveToStorage("provider", provider.results[0]);
        const attributes = provider.results[0].attributes;
        attributes.forEach((element) => {
          if (
            element.attributeType.uuid ===
            "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
            !element.voided
          ) {
            this.specialization = element.value;
          }
          if (
            element.attributeType.uuid ===
            "bdb290d6-97e8-45df-83e6-cadcaf5dcd0f" &&
            !element.voided
          ) {
            this.hostpitalType = element.value;
          }
        });
        userDetails["roles"].forEach((role) => {
          if (role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" ||
            role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a" ||
            role.uuid === "04902b9c-4acd-4fbf-ab37-6d9a81fd98fe") {
            this.systemAccess = true;
          }
        });
        this.getVisits();
        this.getCompletedVisits();
      });
    } else {
      this.authService.logout();
    }
    this.socket.initSocket(true);
    this.socket.onEvent("updateMessage").subscribe((data) => {
      this.socket.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });
      this.playNotify();
    });
    this.translationService.getSelectedLanguage();
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

  getVisits() {
    this.service.getVisits(false).subscribe(
      (response) => {
        const visits = response.results;
        visits.forEach((active) => {
          if (active.encounters.length > 0) {
            if (this.systemAccess) {
              this.visitCategory(active);
            } else if (active.attributes.length) {
              const attributes = active.attributes;
              const hospitalType = attributes.filter(
                (attr) =>
                  attr.attributeType.uuid ===
                  "f288fc8f-428a-4665-a1bd-7b08e64d66e1"
              );
              const speRequired = attributes.filter(
                (attr) =>
                  attr.attributeType.uuid ===
                  "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
              );
              if (speRequired.length) {
                speRequired.forEach((spe, index) => {
                  if (spe.value === this.specialization && hospitalType.length === 0) {
                    if ((index === 0) || (index === 1 && spe[0] !== spe[1])) {
                      this.visitCategory(active);
                    }
                  } else if (spe.value === this.specialization && hospitalType.length && this.hostpitalType === hospitalType[0]?.value) {
                    this.visitCategory(active);
                  }
                });
              }
            }
          }
          this.value = {};
        });
        this.setSpiner = false;
      },
      (err) => {
        if (err.error instanceof Error) {
          this.translationService.getTranslation("Client-side error");
        } else {
          this.translationService.getTranslation("Server-side error");
        }
      }
    );
  }

  getCompletedVisits() {
    this.service.getVisits(true).subscribe(
      (response) => {
        const visits = response.results;
        visits.forEach((active) => {
          if (active.encounters.length > 0) {
            const { encounters = [] } = active;
            let encounter;
            if ((encounter = this.checkVisit(encounters, "Patient Exit Survey")) ||
              (encounter = this.checkVisit(encounters, "Visit Complete"))) {
              let values = this.assignValueToProperty(active, encounter);
              let found = this.completedVisit.find(c => c.id === values.id);
              if (!found) {
                this.completedVisit.push(values);
                this.completeVisitNo += 1;
              }
            } else if (this.checkVisit(encounters, "Remote Prescription")) {
            const values = this.assignValueToProperty(active, encounter);
            let found = this.remoteVisits.find(c => c.id === values.id);
            if (!found) {
              this.remoteVisits.push(values);
              this.remotePatientNo += 1;
            }
          }
        }
        });
        this.setSpiner = false;
      },
      (err) => {
        if (err.error instanceof Error) {
          this.translationService.getTranslation("Client-side error");
        } else {
          this.translationService.getTranslation("Server-side error");
        }
      }
    );
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    let encounter;
    if ((encounter = this.checkVisit(encounters, "Patient Exit Survey")) ||
      (encounter = this.checkVisit(encounters, "Visit Complete"))) {
    } else if (this.checkVisit(encounters, "Remote Prescription") &&
      active.stopDatetime == null) {
    } else if (this.checkVisit(encounters, "Visit Note") &&
      active.stopDatetime == null) {
      const values = this.assignValueToProperty(active, encounter);
      this.progressVisit.push(values);
      this.visitNoteNo += 1;
    } else if ((encounter = this.checkVisit(encounters, "Flagged")) &&
      active.stopDatetime == null) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter);
        this.flagVisit.push(values);
        this.flagPatientNo += 1;
        GlobalConstants.visits.push(active);
      }
    } else if (
      (encounter = this.checkVisit(encounters, "ADULTINITIAL")) ||
      (encounter = this.checkVisit(encounters, "Vitals")) &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.waitingVisit.push(values);
      this.activePatient += 1;
      GlobalConstants.visits.push(active);
    }
  }

  assignValueToProperty(active, encounter) {
    let value: any = {};
    if (!encounter) encounter = active.encounters[0];
    value.visitId = active.uuid;
    value.patientId = active.patient.uuid;
    value.id = active.patient.identifiers[0].identifier;
    value.name = active.patient.person.display;
    value.gender = active.patient.person.gender;
    value.age = active.patient.person.birthdate;
    value.location = active.location.display;
    value.status =
      active.stopDatetime != null
        ? "Visit Complete"
        : encounter?.encounterType.display;
    value.provider =
      active.encounters[0].encounterProviders[0].provider.display.split(
        "- "
      )[1];
    value.lastSeen = active.encounters[0].encounterDatetime;
    return value;
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }
}
