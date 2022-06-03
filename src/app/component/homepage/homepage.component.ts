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
  // flagVisit: VisitData[] = [];
  // waitingVisit: VisitData[] = [];
  // progressVisit: VisitData[] = [];
  // remoteVisits: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  specialization;
  visits = [];
  normalVisits: VisitData[] = [];;
  priorityVisits: VisitData[] = [];;
  systemAccess: boolean = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private socket: SocketService
  ) { }

  ngOnInit() {
    console.log('-------normal', this.normalVisits);
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
        this.visits = response.results;
        this.visits.forEach((active) => {
          active.encounters.sort((a: any, b: any) => {
            return new Date(a.encounterDatetime).getTime() - new Date(b.encounterDatetime).getTime()
          });
          const [encounter] = active.encounters;
          let score = 0;
          if (encounter) {
            if (Array.isArray(encounter.obs)) {
              const yellow = encounter.obs.filter(obs => obs.comment === 'Y').length;
              const red = encounter.obs.filter(obs => obs.comment === 'R').length;
              score += red * 2;
              score += yellow * 1;
              active.score = score;
            }
          }

          // push in respective array as per score
          if (active.score >= 40) {
            this.priorityVisits.push(this.assignValueToProperty(active, encounter))
          } else {
            this.normalVisits.push(this.assignValueToProperty(active, encounter))
          }
        });
        this.setSpiner = false;
      },
      (err) => { }
    );
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  // visitCategory(active) {
  //   const { encounters = [] } = active;
  //   let encounter;
  //   if (
  //     (encounter = this.checkVisit(encounters, "Patient Exit Survey")) ||
  //     (encounter = this.checkVisit(encounters, "Visit Complete")) ||
  //     active.stopDatetime != null
  //   ) {
  //     const values = this.assignValueToProperty(active, encounter);
  //     this.completedVisit.push(values);
  //     this.completeVisitNo += 1;
  //   } else if (
  //     this.checkVisit(encounters, "Remote Prescription") &&
  //     active.stopDatetime == null
  //   ) {
  //     const values = this.assignValueToProperty(active, encounter);
  //     this.remoteVisits.push(values);
  //     this.remotePatientNo += 1;
  //   } else if (
  //     this.checkVisit(encounters, "Visit Note") &&
  //     active.stopDatetime == null
  //   ) {
  //     const values = this.assignValueToProperty(active, encounter);
  //     this.progressVisit.push(values);
  //     this.visitNoteNo += 1;
  //   } else if ((encounter = this.checkVisit(encounters, "Flagged"))) {
  //     if (!this.checkVisit(encounters, "Flagged").voided) {
  //       const values = this.assignValueToProperty(active, encounter);
  //       this.flagVisit.push(values);
  //       this.flagPatientNo += 1;
  //       GlobalConstants.visits.push(active);
  //     }
  //   } else if (
  //     (encounter = this.checkVisit(encounters, "Stage1_Hour1_1")) || (encounter = this.checkVisit(encounters, "Stage1_Hour1_2"))
  //   ) {
  //     const values = this.assignValueToProperty(active, encounter);
  //     this.waitingVisit.push(values);
  //     this.activePatient += 1;
  //     GlobalConstants.visits.push(active);
  //   }
  // }

  assignValueToProperty(active, encounter: any = {}): any {
    return {
      visitId: active.uuid,
      patientId: active.patient.uuid,
      id: active.patient.identifiers[0].identifier,
      name: active.patient.person.display,
      gender: active.patient.person.gender,
      age: active.patient.person.birthdate,
      location: active.location.display,
      status: active.score || 0,
      lastSeen: encounter?.encounterDatetime ? new Date(encounter?.encounterDatetime) : null,
      provider: encounter?.encounterProviders?.[0]?.provider?.display || 'NA'
    };
  }
}
