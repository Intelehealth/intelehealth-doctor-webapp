import { GlobalConstants } from "../../js/global-constants";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AppointmentService } from "src/app/services/appointment.service";
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
export class HomepageComponent implements OnInit {
  value: any = {};
  activePatient = 0;
  flagPatientNo = 0;
  visitNoteNo = 0;
  completeVisitNo = 0;
  endedVisitNo = 0;
  endVisitCount: any;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  endVisits = [];
  setSpiner = true;
  specialization;
  visitStateAttributeType = "0e798578-96c1-450b-9927-52e45485b151";
  specializationProviderType = "ed1715f5-93e2-404e-b3c9-2a2d9600f062";
  visitState = null;
  endVisitData: any;
  visits = []
  slots = []
  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private apnmntSvc: AppointmentService
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
        attributes.forEach((attribute) => {
          if (
            attribute.attributeType.uuid === this.specializationProviderType &&
            !attribute.voided
          ) {
            this.specialization = attribute.value;
          }
          if (
            attribute.attributeType.uuid ===
            this.sessionService.visitStateProviderType
          ) {
            this.visitState = attribute.value;
          }
        });
        this.getVisits();
        this.getVisitCounts(this.specialization);
      });
    } else {
      this.authService.logout();
    }
    this.getEndedVisits();
    this.getDrSlots();
  }

  getStateFromVisit(provider) {
    const attribute = provider.find(
      ({ attributeType }) => attributeType.uuid === this.visitStateAttributeType
    );
    return attribute && attribute.value ? attribute.value : "missing";
  }

  setVisits() {
    let stateVisits = [];
    if (this.visitState && this.visitState !== "All") {
      stateVisits = this.visits.filter(({ attributes }) => {
        const visitState = this.getStateFromVisit(attributes);
        return this.visitState === visitState;
      });
    } else if (this.visitState === "All") {
      stateVisits = this.visits;
    }

    stateVisits.forEach((active) => {
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
  }

  /**
   * Get all visits
   */
  getVisits() {
    this.service.getVisits().subscribe(
      (response) => {
        this.visits = response.results;
        this.setVisits();
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

  /**
   * Check for encounter as per visit type passed
   * @param encounters Array
   * @param visitType String
   * @returns Object | null
   */
  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  /**
   * Check for a visit and put it to the respective table as per their encounter
   * @param visitObject Object
   */
  visitCategory(active) {
    const { encounters = [] } = active;
    if (this.checkVisit(encounters, "Visit Complete")) {
      const values = this.assignValueToProperty(active);
      this.completedVisit.push(values);
      // this.completeVisitNo += 1;
    } else if (this.checkVisit(encounters, "Visit Note")) {
      const values = this.assignValueToProperty(active);
      this.progressVisit.push(values);
      // this.visitNoteNo += 1;
    } else if (this.checkVisit(encounters, "Flagged")) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active);
        this.flagVisit.push(values);
        // this.flagPatientNo += 1;
        GlobalConstants.visits.push(active);
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      this.checkVisit(encounters, "Vitals")
    ) {
      const values = this.assignValueToProperty(active);
      this.waitingVisit.push(values);
      // this.activePatient += 1;
      GlobalConstants.visits.push(active);
    }
  }

  getEndedVisits() {
    this.service.getEndedVisits().subscribe((res) => {
      this.endVisitData = res.results
      let endvisits = this.endVisitData.filter(a => a.stopDatetime != null);
      endvisits.forEach(a => {
        this.endVisits.push(this.assignValueToProperty(a));
        this.endedVisitNo += 1
        localStorage.setItem('endVisitCount', this.endedVisitNo.toString())
      });
      this.setSpiner = false;
    })
  }

  getVisitCounts(speciality) {
    const getTotal = (data, type) => {
      const item = data.find(({ Status }: any) => Status === type);
      return item?.Total || 0;
    };
    this.service.getVisitCounts(speciality).subscribe(({ data }: any) => {
      if (data.length) {
        this.flagPatientNo = getTotal(data, "Priority");
        this.activePatient = getTotal(data, "Awaiting Consult");
        this.visitNoteNo = getTotal(data, "Visit In Progress");
        this.completeVisitNo = getTotal(data, "Completed Visit");
        localStorage.setItem('awaitingVisitsCount', this.activePatient.toString())
      }
    });
  }


  /**
   * Transform visit Object to make it compatible to show in the mat table
   * @param visitObject Object
   * @returns Object
   */
  assignValueToProperty(active) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.age = active.patient.person.age;
    this.value.location = active.location.display;
    this.value.status = active.encounters[0]?.encounterType.display;
    this.value.provider = active.encounters[0]?.encounterProviders[0].provider.display.split(
      "- "
    )[1];
    this.value.lastSeen = active?.encounters[0]?.encounterDatetime;
    this.value.complaints = this.getComplaints(active);
    this.value.disable = !!this.slots.find(slot => slot.openMrsId === this.value.id);
    return this.value;
  }

  getComplaints(visitDetails) {
    let recent: any = [];
    const encounters = visitDetails.encounters;
    encounters.forEach(encounter => {
      const display = encounter.display;
      if (display.match('ADULTINITIAL') !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.display.match('CURRENT COMPLAINT') !== null) {
            const currentComplaint = currentObs.display.split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match('Associated symptoms')) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  get userId() {
    try {
      return JSON.parse(localStorage.user).uuid;
    } catch (error) {
      return null;
    }
  }

  getDrSlots() {
    let toDate = moment().add(1, 'year');
    this.apnmntSvc
      .getUserSlots(
        this.userId,
        moment().format("DD/MM/YYYY"),
        toDate.format("DD/MM/YYYY")
      )
      .subscribe({
        next: (res: any) => {
          this.slots = res.data;
          this.setVisits();
        },
      });
  }
}
