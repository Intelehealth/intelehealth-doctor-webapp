import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChatService } from "src/app/services/chat.service";
import { HeaderService } from "src/app/services/header.service";
import { VisitService } from "src/app/services/visit.service";
import { plusIconAnimations } from "./visit-summary-v4.animation";
declare const getFromStorage: Function;

@Component({
  selector: "app-visit-summary-v4",
  templateUrl: "./visit-summary-v4.component.html",
  styleUrls: ["./visit-summary-v4.component.scss"],
  animations: plusIconAnimations,
})
export class VisitSummaryV4Component implements OnInit {
  buttons = [];
  fabTogglerState = "inactive";
  maxButtons = 6;
  isShowChat: boolean = false;
  messages: any = [];
  patientId: string;
  visitId: string;
  message: any;
  hwName: any;
  toUser: string;
  options = {
    buttons: [
      {
        icon: "assets/svgs/help.svg",
        isHelp: true,
      },
      {
        icon: "assets/svgs/msg.svg",
        isChat: true,
      },
    ],
  };

  constructor(
    private headerSvc: HeaderService,
    public visitSvc: VisitService,
    private chatSvc: ChatService,
    private route: ActivatedRoute
  ) {
    this.headerSvc.showSearchBar = false;
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("patient_id");
    this.visitId = this.route.snapshot.paramMap.get("visit_id");

    const patientVisitProvider = getFromStorage("patientVisitProvider");
    this.toUser = patientVisitProvider?.provider?.uuid;

    const hw = patientVisitProvider?.display?.split(":");
    this.hwName = hw[0];

    this.visitSvc.isHelpButtonShow = true;

    if (this.options.buttons.length > this.maxButtons) {
      this.options.buttons.splice(
        5,
        this.options.buttons.length - this.maxButtons
      );
    }

    if (this.patientId && this.visitId) {
      this.getMessages(
        this.toUser,
        this.patientId,
        this.fromUser,
        this.visitId
      );
    }
  }

  getMessages(toUser, patientId, fromUser, visitId) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messages = res?.data;
        },
      });
  }

  sendMessage() {
    if (this.message) {
      const payload = {
        visitId: this.visitId,
        patientName: this.patientName,
        hwName: this.hwName,
      };
      this.chatSvc
        .sendMessage(this.toUser, this.patientId, this.message, payload)
        .subscribe({
          next: (res) => {
            this.getMessages(
              this.toUser,
              this.patientId,
              this.fromUser,
              this.visitId
            );
          },
          error: () => {
            // this.loading = false;
          },
          complete: () => {
            //  this.loading = false;
          },
        });
      this.message = "";
    }
  }

  readMessages(messageId) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {},
    });
  }

  showItems() {
    this.fabTogglerState = "active";
    this.buttons = this.options.buttons;
  }

  hideItems() {
    this.fabTogglerState = "inactive";
    this.buttons = [];
    this.isShowChat = false;
  }

  toggle() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  selectedButton(btn) {
    if (btn.isChat) {
      this.isShowChat = !this.isShowChat;
    }
    if (this.isShowChat) {
      const messages = this.messages.at(-1);
      this.readMessages(messages?.id);
    }
  }

  get isVisitSummaryShow() {
    return this.visitSvc.isVisitSummaryShow;
  }

  get fromUser() {
    return JSON.parse(localStorage.user).uuid;
  }

  get patientName() {
    return localStorage.patientName || "";
  }

  get readSentLabel() {
    if (this.messages?.isRead) {
      return "Read";
    }
    return "Sent";
  }

  get readSentIcon() {
    if (this.messages?.isRead) {
      return "assets/svgs/read.svg";
    }
    return "assets/svgs/sent-msg.svg";
  }

  ngOnDestroy() {
    this.visitSvc.isHelpButtonShow = false;
  }
}
