import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { SocketService } from "src/app/services/socket.service";
import { ChatComponent } from "../chat/chat.component";
import { AppointmentService } from "src/app/services/appointment.service";

declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

@Component({
  selector: "app-consultation-details-v4",
  templateUrl: "./consultation-details-v4.component.html",
  styleUrls: ["./consultation-details-v4.component.scss"],
})
export class ConsultationDetailsV4Component implements OnInit {
  @ViewChild(ChatComponent) chatComponent: ChatComponent;
  @Input() iconImg = "assets/svgs/consultation-details-icon.svg";
  @Input() showToggle = true;
  @Input() readOnly = false;

  visitCreated: any;
  visitAppointment: Date;
  visitID: string;
  visitDetail;
  providerName: string;
  clinicName: string;
  visitStatus: string;
  hwPhoneNo: number;
  specialization;
  isOpenChat: boolean = false;
  patientUuid: any;
  provider: any;
  currentTheme: "overflow-y";
  changeSide: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private sessionService: SessionService,
    private authService: AuthService,
    private socket: SocketService,
    private appointmentService: AppointmentService,
  ) { }

  ngOnInit() {
    const visitId = this.route.snapshot.params["visit_id"];
    this.patientUuid = this.route.snapshot.params["patient_id"];
    this.provider = getFromStorage("provider");
    this.visitService
      .fetchVisitDetails(visitId)
      .subscribe((visitDetailData) => {
        this.visitDetail = visitDetailData;
        this.visitCreated = this.visitDetail.startDatetime;
        this.visitID = visitId.replace(/.(?=.{4})/g, "x");
        this.clinicName = visitDetailData.display.split("@ ")[1].split(" -")[0];
        visitDetailData.encounters.forEach((encounter) => {
          if (encounter.display.match("ADULTINITIAL") !== null) {
            this.providerName = encounter.encounterProviders[0].display;
            encounter.encounterProviders[0].provider.attributes.forEach(
              (attribute) => {
                if (attribute.display.match("phoneNumber") != null) {
                  this.hwPhoneNo = attribute.value;
                }
              }
            );
          }
        });
        this.visitStatus = this.getVisitStatus(
          visitDetailData.encounters[0].encounterType.display
        );
      });
    this.getAppointmentDetails(visitId);
  }

  ngOnInits() {
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
    this.socket.initSocket(true);
    this.socket.onEvent("updateMessage").subscribe((data) => {
      this.socket.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });
    });
  }

  getVisitStatus(status: string) {
    let statusName: string;
    switch (status) {
      case "Flagged":
        statusName = "Priority visit";
        break;
      case "ADULTINITIAL":
      case "Vitals":
        statusName = "Awaiting visit";
        break;
      case "Visit Note":
        statusName = "In-progress visit";
        break;
      case "Visit Complete":
        statusName = "Completed visit";
        break;
      case "Patient Exit Survey":
        statusName = "Ended visit";
        break;
    }
    return statusName;
  }

  getChat() {
    this.visitService.triggerAction.next({
      action: 'toggleChatBox'
    });
  }

  getAppointmentDetails(visitId) {
    this.appointmentService.getAppointment(visitId).subscribe((res: any) => {
      if (res) {
        this.visitAppointment = res?.data?.slotDate;
      }
    });
  }

  openModal() {
    localStorage.patientUuid = this.patientUuid;
    localStorage.connectToDrId = this.provider?.person?.uuid;

    this.socket.openNewVCModal();
  }

  toggleCollapse() {
    this.changeSide = !this.changeSide;
  }
  get toggleImage() {
    return `assets/svgs/${this.changeSide ? "filter-table-up-arrow.svg" : "filter-table-down-arrow.svg"
      }`;
  }
}
