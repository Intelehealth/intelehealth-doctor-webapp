import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
  gender: string;
  dob: string;
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
export class HomepageComponent implements OnInit {
  value: any = {};
  activePatient: number;
  flagPatientNo: number;
  visitNoteNo: number;
  completeVisitNo: number;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  specialization: string;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar
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
      });
    } else {
      this.authService.logout();
    }
    this.getVisits();
  }

  getVisits() {
    this.service.getVisits().subscribe(
      (response) => {
        let visits1 = [];
        const result = response.results;
        if (this.specialization && this.specialization.toLowerCase() == "all") {
          visits1 = result;
        } else {
          visits1 = result.filter((a) =>
            a.attributes.length > 0
              ? a.attributes.find((b) => {
                  return b.value == this.specialization;
                })
              : ""
          );
        }
        const setObj = new Set();
        var visits = visits1.reduce((acc, item) => {
          if (!setObj.has(item.patient.identifiers[0].identifier)) {
            setObj.add(item.patient.identifiers[0].identifier);
            acc.push(item);
          }
          return acc;
        }, []);

        let length = 0;
        this.flagPatientNo = 0;
        this.visitNoteNo = 0;
        this.completeVisitNo = 0;
        this.activePatient = length;
        visits.forEach((active) => {
          this.visitCategory(active);
          this.value = {};
        });
        this.setSpiner = false;
      },
      (err) => {
        if (err.error instanceof Error) {
          this.snackbar.open("Client-side error", null, { duration: 4000 });
        } else {
          this.snackbar.open("Server-side error", null, { duration: 4000 });
        }
      }
    );
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    if (active.encounters.length > 0) {
      const { encounters = [{}] } = active;
      const value = encounters[0].display;
      if (
        this.checkVisit(encounters, "Patient Exit Survey") ||
        this.checkVisit(encounters, "Visit Complete") ||
        active.stopDatetime != null
      ) {
        const values = this.assignValueToProperty(active);
        this.completedVisit.push(values);
        this.completeVisitNo += 1;
      } else if (
        this.checkVisit(encounters, "Visit Note") &&
        active.stopDatetime == null
      ) {
        const values = this.assignValueToProperty(active);
        this.progressVisit.push(values);
        this.visitNoteNo += 1;
      } else if (this.checkVisit(encounters, "Flagged")) {
        if (!this.checkVisit(encounters, "Flagged").voided) {
          const values = this.assignValueToProperty(active);
          this.flagVisit.push(values);
          this.flagPatientNo += 1;
        }
      } else if (
        (this.checkVisit(encounters, "ADULTINITIAL") ||
          this.checkVisit(encounters, "Vitals")) &&
        active.stopDatetime == null
      ) {
        const values = this.assignValueToProperty(active);
        this.waitingVisit.push(values);
        length += 1;
      }
    }
  }

  assignValueToProperty(active) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    var speciality = active.attributes.filter(a=>a.attributeType.uuid === "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d")
    this.value.speciality = speciality[0].value;
    this.value.age = active.patient.person.age
      ? active.patient.person.age + " Years"
      : "Not Provided";
    this.value.location = active.location.display;
    this.value.status =
      active.stopDatetime != null
        ? "Visit Complete"
        : active.encounters[0].encounterType.display;
    this.value.provider =
      active.encounters[0].encounterProviders[0].provider.display.split(
        "- "
      )[1];
    this.value.lastSeen = active.encounters[0].encounterDatetime;
    return this.value;
  }
}
