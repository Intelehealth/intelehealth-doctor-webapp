import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
import { HelperService } from "src/app/services/helper.service";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Component({
  selector: "app-dashboard-summary-page",
  templateUrl: "./dashboard-summary-page.component.html",
  styleUrls: ["./dashboard-summary-page.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardSummaryPageComponent implements OnInit {
  value: any = {};
  flagPatientNo = 0;
  activePatient = 0;
  visitNoteNo = 0;
  completeVisitNo = 0;
  setSpiner = true;
  specialization;
  allVisits = [];
  appointmentTable: any = {
    id: "appointmentTable",
    label: "Appointments",
    lableIconPath: "assets/svgs/video-frame.svg",
    headers: [
      { name: "Patient", imageKey: "profile"},
      { name: "Age" },
      { name: "Start In" },
      { name: "Location" },
      { name: "Cheif complaint" },
      { name: "Action", headerClass: "text-center" },
    ],
  };

  priorityVisits: any = {
    label: "Priority Visits",
    lableIconPath: "assets/svgs/red-profile.svg",
    headers: [
      { name: "Patient" },
      { name: "Age" },
      { name: "Location" },
      { name: "Cheif complaint" },
      { name: "Visit Created", headerClass: "text-center" },
    ],
  };

  awaitingVisits: any = {
    label: "Awaiting Visits",
    lableIconPath: "assets/svgs/green-profile.svg",
    headers: [
      { name: "Patient" },
      { name: "Age" },
      { name: "Location" },
      { name: "Cheif complaint" },
      { name: "Visit Created", headerClass: "text-center" },
    ],
  };

  inProgressVisits: any = {
    label: "In-progress visits",
    lableIconPath: "assets/svgs/pen-board.svg",
    headers: [
      { name: "Patient" },
      { name: "Age" },
      { name: "Location" },
      { name: "Cheif complaint" },
      { name: "Prescription started", headerClass: "text-center" },
    ],
  };

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private socket: SocketService,
    private helper: HelperService,
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
        this.getVisits();
        this.getVisitCounts(this.specialization);
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
    });
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
      }
    });
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
                    this.visitCategory(active);
                  }
                });
              }
            } else if (this.specialization === "General Physician") {
              this.visitCategory(active);
            }
          }
          this.value = {};
        });
        if (response.results.length === 0) {
          this.setVisitlengthAsPerLoadedData();
        }
        this.helper.refreshTable.next();
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
    if (
      (encounter =
        this.checkVisit(encounters, "Visit Complete") ||
        this.checkVisit(encounters, "Patient Exit Survey"))
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.completedVisit.push(values);
    } else if ((encounter = this.checkVisit(encounters, "Visit Note"))) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.progressVisit.push(values);
    } else if ((encounter = this.checkVisit(encounters, "Flagged"))) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter);
        this.service.flagVisit.push(values);
      }
    } else if (
      (encounter =
        this.checkVisit(encounters, "ADULTINITIAL") ||
        this.checkVisit(encounters, "Vitals"))
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.waitingVisit.push(values);
    }
  }

  getPhoneNumber(attributes) {
    let phoneObj = attributes.find(({ display = "" }) =>
      display.includes("Telephone Number")
    );
    return phoneObj ? phoneObj.value : "NA";
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

  getVisisCreated(visitDetails){
    const start = new Date().getTime();
    const end = new Date(visitDetails.encounters[0].encounterDatetime).getTime();
    let time = start - end;  
    let diffDays = Math.floor(time /  86400000)
    let diffHours = Math.floor(time %  86400000 / 3600000)
    if(diffDays > 0){
      return diffDays + " day ago";
    }else{
      return diffHours + " hr ago";
    }
    
  }
  
  assignValueToProperty(active, encounter) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.telephone = this.getPhoneNumber(active.patient.attributes);
    this.value.gender = active.patient.person.gender;
    this.value.age = active.patient.person.age;
    this.value.location = active.location.display;
    this.value.status = encounter.encounterType.display;
    this.value.provider = encounter.encounterProviders[0].provider.display.split("- ")[1];
    this.value.lastSeen = encounter.encounterDatetime;
    this.value.complaints = this.getComplaints(active);
    this.value.visitCreated = this.getVisisCreated(active);
    return this.value;
  }
}
