import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
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
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
})
export class HomepageComponent implements OnInit, OnDestroy {
  value: any = {};
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  specialization;
  specialityAttrType = "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d";
  visitModeAttrType = "443d91e7-3897-4307-a549-787da32e241e";
  currentMode = "";
  modes = {
    camp: "Camp Mode",
    remote: "Remote Mode",
  };

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private socket: SocketService,
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
        this.getVisits();
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

    if (!this.modes[localStorage.getItem("mode")])
      localStorage.setItem("mode", Object.keys(this.modes)[1]);
    this.currentMode = this.modes[localStorage.mode];
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

  visits = [];
  showVisits() {
    this.setSpiner = true;
    this.flagVisit = [];
    this.waitingVisit = [];
    this.progressVisit = [];
    this.completedVisit = [];
    this.visits.forEach((active) => {
      if (active.encounters.length > 0) {
        if (active.attributes.length) {
          const { attributes } = active;
          const visitModeAttribute = attributes.find(
            ({ attributeType }) => attributeType.uuid === this.visitModeAttrType
          );
          if (!visitModeAttribute) return;
          const filterBy =
            this.currentMode === this.modes.camp
              ? ["Live Generalized", "Live Specialized"]
              : ["Telehealth Generalized", "Telehealth Specialized"];

          if (filterBy.includes(visitModeAttribute?.value)) {
            const speRequired = attributes.filter(
              ({ attributeType }) =>
                attributeType.uuid === this.specialityAttrType
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
        // else if (this.specialization === "General Physician") {
        //   this.visitCategory(active);
        // }
      }
      this.value = {};
    });
    this.helper.refreshTable.next();
    setTimeout(() => {
      this.setSpiner = false;
    }, 300);
  }

  getVisits() {
    this.service.getVisits().subscribe({
      next: (response) => {
        this.visits = response.results;
        this.showVisits();
      },
      error: (err) => {
        if (err.error instanceof Error) {
          this.snackbar.open("Client-side error", null, { duration: 4000 });
        } else {
          this.snackbar.open("Server-side error", null, { duration: 4000 });
        }
      },
      complete: () => {
        this.setSpiner = false;
      },
    });
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    if (
      this.checkVisit(encounters, "Patient Exit Survey") ||
      this.checkVisit(encounters, "Visit Complete") ||
      active.stopDatetime != null
    ) {
      const values = this.assignValueToProperty(active);
      this.completedVisit.push(values);
    } else if (
      this.checkVisit(encounters, "Visit Note") &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active);
      this.progressVisit.push(values);
    } else if (this.checkVisit(encounters, "Flagged")) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active);
        this.flagVisit.push(values);
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      (this.checkVisit(encounters, "Vitals") && active.stopDatetime == null)
    ) {
      const values = this.assignValueToProperty(active);
      this.waitingVisit.push(values);
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
    this.value.status =
      active.stopDatetime != null
        ? "Visit Complete"
        : active.encounters[0]?.encounterType.display;
    this.value.provider =
      active.encounters[0].encounterProviders[0].provider.display.split(
        "- "
      )[1];
    this.value.lastSeen = active.encounters[0].encounterDatetime;
    return this.value;
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  toggleMode(e) {
    const idx = e.checked ? 0 : 1;
    localStorage.setItem("mode", Object.keys(this.modes)[idx]);
    this.currentMode = this.modes[localStorage.getItem("mode")];
    this.showVisits();
  }
}
