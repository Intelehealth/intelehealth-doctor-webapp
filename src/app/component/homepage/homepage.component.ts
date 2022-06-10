import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { SocketService } from "src/app/services/socket.service";
import * as moment from "moment";
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
  allowedNotesToShow = [
    'Baseline FHR',
    'FHR Deceleration',
    'Amniotic fluid',
    'Moulding',
    'Systolic BP',
    'Diastolic BP'
  ]
  // flagVisit: VisitData[] = [];
  // waitingVisit: VisitData[] = [];
  // progressVisit: VisitData[] = [];
  // remoteVisits: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  specialization;
  visits = [];
  normalVisits: VisitData[] = [];
  priorityVisits: VisitData[] = [];
  systemAccess: boolean = false;
  overdueIn = 60;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private socket: SocketService
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
            return (
              new Date(a.encounterDatetime).getTime() -
              new Date(b.encounterDatetime).getTime()
            );
          });
          const [encounter] = active.encounters;
          let score = 0;
          if (encounter) {
            if (Array.isArray(encounter.obs)) {
              const yellow = encounter.obs.filter(
                (obs) => obs.comment === "Y"
              ).length;
              const red = encounter.obs.filter(
                (obs) => obs.comment === "R"
              ).length;
              score += red * 2;
              score += yellow * 1;
              active.score = score;
            }
          }

          let visitEncounter;
          const { encounters = [] } = active;
          // push in respective array as per score

          if (
            (visitEncounter = this.checkVisit(encounters, "Patient Exit Survey")) ||
            (visitEncounter = this.checkVisit(encounters, "Visit Complete")) ||
            active.stopDatetime != null
          ) {
            this.completedVisit.push(this.assignValueToProperty(active, visitEncounter));
          } else if (active.score >= 22) {
            this.priorityVisits.push(
              this.assignValueToProperty(active, encounter)
            );
          } else {
            this.normalVisits.push(
              this.assignValueToProperty(active, encounter)
            );
          }
        });
        this.normalVisits = this.normalVisits.sort((b: any, a: any) => a.status - b.status)
        this.priorityVisits = this.priorityVisits.sort((b: any, a: any) => a.status - b.status)
        this.setSpiner = false;
      },
      (err) => { }
    );
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  assignValueToProperty(active, encounter: any = {}): any {
    let overdueIn;
    let notes;
    let stage = 1;
    if (active?.encounters?.length) {
      if (active.encounters.filter(vst => vst.display.includes('Stage2')).length > 0) {
        stage = 2;
      }
    }
    if (encounter) {
      const duration = moment.duration(
        moment(new Date()).diff(moment(encounter.encounterDatetime))
      );
      overdueIn =
        duration.asMinutes() >= this.overdueIn ? `${duration.asHours().toFixed(2)} hrs` : "";
    }

    notes = null;
    if (Array.isArray(active.encounters)) {
      active.encounters.forEach((encounter: any) => {
        if (Array.isArray(encounter.obs)) {
          encounter.obs.forEach((obs) => {
            if (obs?.comment === "R") {
              if (!notes) notes = [];
              const key = obs.display.split(':')[0];
              const value = obs.display.split(':')[1];
              if (this.allowedNotesToShow.includes(key)) {
                notes.push({ key, value });
              }
            }
          });
        }
      });
      if (Array.isArray(notes)) {
        notes = notes.sort((a, b) => a?.key.localeCompare(b?.key));
        notes = Array.from(new Set(notes))
      }
    }

    return {
      visitId: active.uuid,
      patientId: active.patient.uuid,
      id: active.patient.identifiers[0].identifier,
      name: active.patient.person.display,
      // gender: active.patient.person.gender,
      // age: active.patient.person.birthdate,
      location: active.location.display,
      status: Number(active.score) || 0,
      stage,
      notes,
      overdue: overdueIn,
      lastSeen: encounter?.encounterDatetime
        ? new Date(encounter?.encounterDatetime)
        : null,
      provider: encounter?.encounterProviders?.[0]?.provider?.name || "NA",
    };
  }
}
