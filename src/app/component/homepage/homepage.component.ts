import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HelperService } from "src/app/services/helper.service";
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
  encounters: Array<any>;
  attributes: Array<any>;
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
})
export class HomepageComponent implements OnInit, OnDestroy {
  value: any = {};

  setSpiner = true;
  specialization;
  allVisits: VisitData[] = [];
  loadedPageNumber: Number;
  limit = 200;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private helper: HelperService
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

  ngOnDestroy() {
    this.service.flagVisit = [];
    this.service.waitingVisit = [];
    this.service.progressVisit = [];
    this.service.completedVisit = [];
  }

  get nextPage() {
    return Number((this.allVisits.length / this.limit).toFixed()) + 2;
  }

  getVisits(query: any = {}, cb = () => {}) {
    this.service.getVisits(query).subscribe(
      (response) => {
        response.results.forEach((item) => {
          this.allVisits = this.helper.getUpdatedValue(this.allVisits, item);
        });
        this.allVisits.forEach((active) => {
          if (active.encounters.length > 0) {
            if (active.attributes.length) {
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
            } else if (this.specialization === "General Physician") {
              this.visitCategory(active);
            }
          }
          this.value = {};
        });
        this.setSpiner = false;
        if (typeof cb === "function") cb();
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

  get completeVisitNo() {
    return this.service.completedVisit.length;
  }
  get visitNoteNo() {
    return this.service.progressVisit.length;
  }

  get flagPatientNo() {
    return this.service.flagVisit.length;
  }
  get activePatient() {
    return this.service.waitingVisit.length;
  }

  get completedVisit() {
    return this.service.completedVisit;
  }
  get progressVisit() {
    return this.service.progressVisit;
  }

  get flagVisit() {
    return this.service.flagVisit;
  }
  get waitingVisit() {
    return this.service.waitingVisit;
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    const update = this.helper.getUpdatedValue;
    if (this.checkVisit(encounters, "Visit Complete")) {
      const values = this.assignValueToProperty(active);
      this.service.completedVisit = update(this.completedVisit, values, "id");
    } else if (this.checkVisit(encounters, "Visit Note")) {
      const values = this.assignValueToProperty(active);
      this.service.progressVisit = update(this.progressVisit, values, "id");
    } else if (this.checkVisit(encounters, "Flagged")) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active);
        this.service.flagVisit = update(this.flagVisit, values, "id");
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      this.checkVisit(encounters, "Vitals")
    ) {
      const values = this.assignValueToProperty(active);
      this.service.waitingVisit = update(this.waitingVisit, values, "id");
    }
  }

  assignValueToProperty(active) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.age = active.patient.person.age;
    this.value.location = active.location.display;
    this.value.status = active.encounters[0].encounterType.display;
    this.value.provider = active.encounters[0].encounterProviders[0].provider.display.split(
      "- "
    )[1];
    this.value.lastSeen = active.encounters[0].encounterDatetime;
    return this.value;
  }

  tableChange({ loadMore, refresh }) {
    if (loadMore) {
      this.setSpiner = true;
      const query = {
        limit: this.limit,
        startIndex: this.allVisits.length,
      };
      this.getVisits(query, refresh);
    }
  }
}
