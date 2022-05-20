import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
import { HelperService } from "src/app/services/helper.service";
import { GlobalConstants } from "src/app/js/global-constants";
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
  systemAccess: boolean = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private socket: SocketService
  ) {}

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
        });
        userDetails["roles"].forEach((role) => {
          if (
            role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" ||
            role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a" ||
            role.uuid === "04902b9c-4acd-4fbf-ab37-6d9a81fd98fe"
          ) {
            this.systemAccess = true;
          }
        });
        this.getVisits();
      });
    } else {
      this.authService.logout();
    }
    this.socket.initSocket(true);
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

  getVisits() {
    this.service.getVisits().subscribe(
      (response) => {
        const visits = response.results;
        visits.forEach((active) => {
          if (active.encounters.length > 0) {
            if (this.systemAccess) {
              this.visitCategory(active);
            } else if (active.attributes.length) {
              const attributes = active.attributes;
              const speRequired = attributes.filter(
                (attr) =>
                  attr.attributeType.uuid ===
                  "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
              );
              if (speRequired.length) {
                speRequired.forEach((spe, index) => {
                  if (spe.value === this.specialization) {
                    if (index === 0) {
                      this.visitCategory(active);
                    }
                    if (index === 1 && spe[0] !== spe[1]) {
                      this.visitCategory(active);
                    }
                  }
                });
              }
            }
          }
          this.value = {};
        });
        this.setSpiner = false;
      },
      (err) => {}
    );
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    let encounter;
    if (
      (encounter = this.checkVisit(encounters, "Patient Exit Survey")) ||
      (encounter = this.checkVisit(encounters, "Visit Complete")) ||
      active.stopDatetime != null
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.completedVisit.push(values);
      this.completeVisitNo += 1;
    } else if (
      this.checkVisit(encounters, "Remote Prescription") &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.remoteVisits.push(values);
      this.remotePatientNo += 1;
    } else if (
      this.checkVisit(encounters, "Visit Note") &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.progressVisit.push(values);
      this.visitNoteNo += 1;
    } else if ((encounter = this.checkVisit(encounters, "Flagged"))) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter);
        this.flagVisit.push(values);
        this.flagPatientNo += 1;
        GlobalConstants.visits.push(active);
      }
    } else if (
      (encounter = this.checkVisit(encounters, "Stage1_Hour1_1")) || (encounter = this.checkVisit(encounters, "Stage1_Hour1_2"))
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.waitingVisit.push(values);
      this.activePatient += 1;
      GlobalConstants.visits.push(active);
    }
  }

  assignValueToProperty(active, encounter) {
    if (!encounter) encounter = active.encounters[0];
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.age = active.patient.person.birthdate;
    this.value.location = active.location.display;
    this.value.status =
      active.stopDatetime != null
        ? "Visit Complete"
        : encounter?.encounterType.display;
    this.value.provider =
      active.encounters[0].encounterProviders[0].provider.display.split(
        "- "
      )[1];
    this.value.lastSeen = active.encounters[0].encounterDatetime;
    return this.value;
  }
}
