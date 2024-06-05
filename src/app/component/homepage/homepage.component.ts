import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HelperService } from "src/app/services/helper.service";
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
  flagPatientNo = 0;
  activePatient = 0;
  visitNoteNo = 0;
  completeVisitNo = 0;
  followUpVisitNo = 0;
  totalCompletedVisits = 0;
  totalFollowUpVisit = 0;
  setSpiner = true;
  setSpiner1 = true;
  specialization;
  allVisits = [];
  followUpVisit = [];
  limit = 100;
  allVisitsLoaded = false;
  systemAccess = false;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private helper: HelperService,
    private cdr: ChangeDetectorRef
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
          if (role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" ||
            role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a") {
            this.systemAccess = true;
          }
        });
        this.getVisitCounts(this.specialization);
        this.getVisits();
      });
    } else {
      this.authService.logout();
    }
  }

  getVisitCounts(speciality) {
    const getTotal = (data, type, followupStatus) => {
      const item = data.find(({ Status,followup_status }: any) => Status === type && followup_status === followupStatus);
      return item?.Total || 0;
    };
    this.service.getVisitCounts(speciality).subscribe(({ data }: any) => {
      if (data.length) {
        // this.flagPatientNo = getTotal(data, "Priority");
        // this.activePatient = getTotal(data, "Awaiting Consult");
        // this.visitNoteNo = getTotal(data, "Visit In Progress");
        let totalCount =  getTotal(data, "Completed Visit","Followup case") + getTotal(data, "Completed Visit","Non Followup case");
        if( localStorage.totalCompletedVisits) {
          if( totalCount >= localStorage.totalCompletedVisits) {
            this.totalCompletedVisits = totalCount;
            localStorage.totalCompletedVisits = totalCount;
            this.totalFollowUpVisit = getTotal(data, "Completed Visit", "Followup case");
            localStorage.totalFollowUpVisits = this.totalFollowUpVisit;
          } else {
            this.totalCompletedVisits = localStorage.totalCompletedVisits;
            this.totalFollowUpVisit = localStorage.totalFollowUpVisits;
            this.getVisitCounts(this.specialization);
          }
        } else {
          this.totalCompletedVisits = totalCount;
          localStorage.totalCompletedVisits = totalCount;
          this.totalFollowUpVisit = getTotal(data, "Completed Visit", "Followup case");
          localStorage.totalFollowUpVisits = this.totalFollowUpVisit;
        }
      }
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getVisits(query: any = {}, cb = () => { }) {
    this.service.getVisits(query, false).subscribe(
      (response) => {
        response.results.forEach((item) => {
          if(item.patient.identifiers.length) {
            var i = this.allVisits.findIndex(x => x.patient.identifiers[0].identifier == item.patient.identifiers[0].identifier);
            if (i <= -1) {
              this.allVisits.push(item);
            }
          }
        });
        this.allVisits.forEach((active) => {
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
                    this.visitCategory(active);
                  }
                });
              }
            }
          }
          this.value = {};
        });
        this.setVisitlengthAsPerLoadedData();
        if (response.results.length === 0) {
          this.setVisitlengthAsPerLoadedData();
          this.allVisitsLoaded = true;
        }
        this.helper.refreshTable.next();
        this.setSpiner = false;
        this.isLoadingNextSlot = false;
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

  getLength(arr) {
    let data = [];
    arr.forEach((item) => {
      data = this.helper.getUpdatedValue(data, item, "id");
    });
    return data.filter((i) => i).slice().length;
  }

  setVisitlengthAsPerLoadedData() {
    this.flagPatientNo = this.getLength(this.flagVisit);
    this.activePatient = this.getLength(this.waitingVisit);
    this.visitNoteNo = this.getLength(this.progressVisit);
    this.completeVisitNo = this.getLength(this.completedVisit);
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

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    let encounter;
    if (this.checkVisit(encounters, "Visit Complete") ||
      this.checkVisit(encounters, "Patient Exit Survey")
      || active.stopDatetime != null) {
      const values = this.assignValueToProperty(active, encounter);
      let found = this.service.completedVisit.find(c => c.id === values.id);
      if (!found) {
        this.service.completedVisit.push(this.setValues(values, active));
      }
    } else if (this.checkVisit(encounters, "Visit Note") &&
      active.stopDatetime == null) {
      const values = this.assignValueToProperty(active, encounter);
      let found = this.service.progressVisit.find(c => c.id === values.id);
      if (!found) {
        this.service.progressVisit.push(values);
      }
    } else if (this.checkVisit(encounters, "Flagged") &&
      active.stopDatetime == null) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter);
        let found = this.service.flagVisit.find(c => c.id === values.id);
        if (!found) {
          this.service.flagVisit.push(values);
        }
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      this.checkVisit(encounters, "Vitals") &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active, encounter);
      let found = this.service.waitingVisit.find(c => c.id === values.id);
      if (!found) {
        this.service.waitingVisit.push(values);
      }
    }
  }

  get nextPage() {
    return Number((this.allVisits.length / this.limit).toFixed()) + 2;
  }

  tableChange({ loadMore, refresh }) {
    if (loadMore) {
      if (!this.isLoadingNextSlot) this.setSpiner = true;
      const query = {
        limit: this.limit,
        startIndex: this.allVisits.length,
      };
      this.getVisits(query, refresh);
    }
  }

  isLoadingNextSlot = false;
  loadNextSlot() {
    if (!this.isLoadingNextSlot && !this.allVisitsLoaded) {
      this.isLoadingNextSlot = true;
      this.tableChange({ loadMore: true, refresh: () => { } });
    }
  }
  getPhoneNumber(attributes) {
    let phoneObj = attributes.find(({ display = "" }) =>
      display.includes("Telephone Number")
    );
    return phoneObj ? phoneObj.value : "NA";
  }
  assignValueToProperty(active, encounter, followUpDate?) {
    let value:any= {}
    value.visitId = active.uuid;
    value.patientId = active.patient.uuid;
    value.id = active.patient.identifiers[0].identifier;
    value.name = active.patient.person.display;
    value.telephone = this.getPhoneNumber(active.patient.attributes);
    value.gender = active.patient.person.gender;
    value.age = active.patient.person.age;
    value.location = active.location.display;
    value.status = active.encounters[0]?.encounterType.display;
    let visitCompleteEnc = active.encounters.find(enc => enc.display.includes("Visit Complete"));
      if(visitCompleteEnc) {
        value.provider = visitCompleteEnc?.encounterProviders[0]?.provider.display.split("- ")[1];
      } else {
        value.provider = active.encounters[0]?.encounterProviders[0]?.provider.display.split("- ")[1];
      }
    value.lastSeen = active.encounters[0]?.encounterDatetime;
    value.date =  moment(followUpDate, "DD-MM-YYYY").format("DD-MMM-YYYY");
    value.isPastDate = moment().toDate() > moment(followUpDate, "DD-MM-YYYY").toDate();
    return value;
  }

  setValues(value, visitDetail) {
    let values = value;
    visitDetail.encounters.forEach(encounter => {
      if (encounter.display.match('ADULTINITIAL') !== null) {
        values.healthWorker = encounter.encounterProviders[0].provider.display.split("- ")[1];
      }

      if (encounter.display.match('Visit Note') !== null) {
        let diagnosis = [];
        encounter.obs.forEach(res => {
          if (res.display.match('TELEMEDICINE DIAGNOSIS') !== null) {
            diagnosis.push(res.value);
          }
        });
        values.diagnosis = diagnosis.length > 0 ? diagnosis : "Not Provided";
      }
      return values;
    });
    return values;
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  getFollowUpdVisits() {
    this.setSpiner1= true;
    this.followUpVisit = [];
    this.followUpVisitNo = 0;
    this.service.getFollowupVisits().subscribe(
      (response) => {
        console.log("response.results",response.data)
        response.data.forEach((visit) => {
        let v = this.assignValueToVisit(visit);  
        let found = this.followUpVisit.find(c => c.id === v.id);
        if (!found) {
          this.followUpVisit.push(v);
          this.followUpVisitNo += 1;
        }
        });
        this.setSpiner1 = false;
      });
  }

  assignValueToVisit(visit) {
    let value:any= {}
    value.visitId = visit.visitId;
    value.patientId = visit.patientId;
    value.id = visit.patientID;
    value.name = visit.patientName;
    value.telephone = visit.phoneNo;
    value.gender = visit.gender;
    value.age = visit.age;
    value.location = visit.visitLocation;
    value.provider = visit.provider;
    value.lastSeen = visit.lastSeen;
    value.date =  moment(visit.followUpDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').format("DD-MMM-YYYY");
    value.isPastDate = moment().toDate() > moment(visit.followUpDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').toDate();
    value.diagnosis = visit.diagnosis ? visit.diagnosis : "Not Provided";
    return value;
  }
}
