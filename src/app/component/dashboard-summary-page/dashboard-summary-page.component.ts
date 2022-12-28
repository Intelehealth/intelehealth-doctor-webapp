import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
import { HelperService } from "src/app/services/helper.service";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";
import { HeaderService } from "src/app/services/header.service";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Component({
  selector: "app-dashboard-summary-page",
  templateUrl: "./dashboard-summary-page.component.html",
  styleUrls: ["./dashboard-summary-page.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardSummaryPageComponent implements OnInit {
  value: any = {};
  setSpiner = true;
  specialization;
  allVisits = [];
  viewDate: Date = new Date();
  drSlots = [];

  appointmentTable: any = {
    id: "appointmentTable",
    label: "Appointments",
    lableIconPath: "assets/svgs/video-frame.svg",
    info: "Scheduled appointments",
    collapse: "#collapseAppointment",
    toggle: "collapse",
    dataCount: 0,
    headers: [
      {
        name: "Patient",
        type: "stringwithimage",
        key: "patientName",
        imageKey: "profile",
      },
      { name: "Age", type: "number", key: "age" },
      { name: "Start In", type: "string", key: "startIn" },
      { name: "Location", type: "string", key: "location" },
      { name: "Cheif complaint", type: "array", key: "complaint" },
      {
        name: "Action",
        type: "multibutton",
        headerClass: "text-center",
        id:[],
        buttons: [
          {
            label: "Reschedule",
            onClick: this.onRescheduleClick,
            btnClass: "mr-3 re-btn",
          },
          {
            label: "Cancel",
            onClick: this.onCancelClick,
            btnClass: "ce-btn",
          },
        ],
      },
    ],
    data: [],
  };

  priorityVisits: any = {
    id: "priorityTable",
    label: "Priority Visits",
    lableIconPath: "assets/svgs/red-profile.svg",
    info: "High priority visits",
    dataCount: 0,
    headers: [
      {
        name: "Patient",
        type: "stringwithimage",
        key: "patientName",
        imageKey: "profile",
      },
      { name: "Age", type: "number", key: "age" },
      { name: "Location", type: "string", key: "location" },
      { name: "Cheif complaint", type: "array", key: "complaint" },
      {
        name: "Visit Created",
        type: "pill",
        headerClass: "text-center",
        imageKey: "summaryListIcon",

        buttons: [
          { btnClass: "summay-btn pill-btn" },
        ],
      },
    ],
    data: [],
  };

  awaitingVisits: any = {
    id: "awaitingTable",
    label: "Awaiting visits",
    lableIconPath: "assets/svgs/green-profile.svg",
    info: "General Uploaded Visits",
    dataCount: 0,
    headers: [
      {
        name: "Patient",
        type: "stringwithimage",
        key: "patientName",
        imageKey: "profile",
      },
      { name: "Age", type: "number", key: "age" },
      { name: "Location", type: "string", key: "location" },
      { name: "Cheif complaint", type: "array", key: "complaint" },
      {
        name: "Visit Created",
        type: "pill",
        headerClass: "text-center",
        imageKey: "summaryListIcon",

        buttons: [
          {
            label: "16 hr ago",

            btnClass: "summay-btn pill-btn",
          },
        ],
      },
    ],
    data: [],
  };

  inProgressVisits: any = {
    id: "inProgressTable",
    label: "In-progress visits",
    lableIconPath: "assets/svgs/pen-board.svg",
    info: "Visits going through the consultations",
    dataCount: 0,
    headers: [
      {
        name: "Patient",
        type: "stringwithimage",
        key: "patientName",
        imageKey: "profile",
      },
      { name: "Age", type: "number", key: "age" },
      { name: "Location", type: "string", key: "location" },
      { name: "Cheif complaint", type: "array", key: "complaint" },
      {
        name: "Prescription started",
        type: "pill",
        headerClass: "text-center",
        imageKey: "summaryListIcon",

        buttons: [
          {
            label: "16 hr ago",

            btnClass: "summay-btn pill-btn",
          },
        ],
      },
    ],
    data: [],
  };
  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private socket: SocketService,
    private helper: HelperService,
    private appointmentService: AppointmentService,
    private headerSvc :HeaderService
  ) {
    this.headerSvc.showSearchBar = true;
  }

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
      this.playNotify();
    });
    let endOfMonth = moment(this.viewDate).endOf("month").format("YYYY-MM-DD hh:mm");
    this.getDrSlots(endOfMonth);
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

  getVisitCounts(speciality) {
    const getTotal = (data, type) => {
      const item = data.find(({ Status }: any) => Status === type);
      return item?.Total || 0;
    };
    this.service.getVisitCounts(speciality).subscribe(({ data }: any) => {
      if (data.length) {
        this.inProgressVisits.dataCount = getTotal(data, "Visit In Progress");
        this.priorityVisits.dataCount = getTotal(data, "Priority");
        this.awaitingVisits.dataCount = getTotal(data, "Awaiting Consult");
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

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    let encounter;
    if ((encounter = this.checkVisit(encounters, "Visit Complete") || this.checkVisit(encounters, "Patient Exit Survey"))) {
      const values = this.assignValueToProperty(active, encounter);
      // this.service.completedVisit.push(values);
    } else if ((encounter = this.checkVisit(encounters, "Visit Note"))) {
      const values = this.assignValueToProperty(active, encounter);
      // this.service.progressVisit.push(values);
      this.inProgressVisits.data.push(values);
    } else if ((encounter = this.checkVisit(encounters, "Flagged"))) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter);
        // this.service.flagVisit.push(values);
        this.priorityVisits.data.push(values);
      }
    } else if ((encounter = this.checkVisit(encounters, "ADULTINITIAL") || this.checkVisit(encounters, "Vitals"))) {
      const values = this.assignValueToProperty(active, encounter);
      // this.service.waitingVisit.push(values);
      this.awaitingVisits.data.push(values);
    }
    let e = encounter = this.checkVisit(encounters, "Visit Complete") || this.checkVisit(encounters, "Patient Exit Survey") || this.checkVisit(encounters, "Visit Note") || this.checkVisit(encounters, "Flagged") || this.checkVisit(encounters, "ADULTINITIAL")
    const values = this.assignValueToProperty(active, e);
    for(let i = 0; i < this.drSlots.length; i++) {
      if(values.patientId === this.drSlots[i]["patientId"]){
        this.appointmentTable.headers[5].id.push(this.drSlots[i]);
        const value = this.assignValueToProperty(active, e, this.drSlots[i]);
        this.appointmentTable.data.push(value);
        this.appointmentTable.dataCount = this.appointmentTable.data.length
      };
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

  assignValueToProperty(active, encounter, drSlots={}) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.telephone = this.getPhoneNumber(active.patient.attributes);
    this.value.gender = active.patient.person.gender;
    this.value.age = active.patient.person.age;
    this.value.location = active.location.display;
    this.value.status = encounter?.encounterType.display;
    this.value.provider = encounter?.encounterProviders[0].provider.display.split("- ")[1];
    this.value.lastSeen = encounter?.encounterDatetime;
    this.value.complaints = this.getComplaints(active);
    this.value.visitCreated = this.getVisisCreated(active);
    this.value.startIn = this.startIn(drSlots);
    return this.value;
  }

  onRescheduleClick() {}

  onCancelClick() {}

  getDrSlots(toDate) {
    this.appointmentService
      .getUserSlots(
        this.userId,
        moment('2022-01-01 12:00').format("DD/MM/YYYY"),
        moment(toDate).format("DD/MM/YYYY")
      )
      .subscribe({
        next: (res: any) => {
          this.drSlots = res.data;
        },
      });
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  startIn(data){
    if(Object.keys(data).length !== 0){
      for(let i in data){
        const start = new Date().getTime();
        const end = new Date(data['slotJsDate']).getTime();
        let time = start - end;
        let diffDays = Math.floor(time /  86400000)
        if( String(diffDays)[0] == "-"){
          return moment(data['slotJsDate']).format("DD MMM, h:mm a");
        }else{
          return(moment(data['slotJsDate']).format("DD MMM, h:mm a"));
        }
      };
    }
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }
}
