import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from "@angular/core";
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
  @ViewChild('chatBody') chatBody: ElementRef;
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
      this.getMessages();
    }

    this.visitSvc.triggerAction.subscribe({
      next: ((res: any) => {
        switch (res.action) {
          case 'toggleChatBox':
            this.toggleChat();
            break;
        }
      })
    })
  }

  getMessages(toUser = this.toUser, patientId = this.patientId, fromUser = this.fromUser, visitId = this.visitId) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messages = res?.data;
          this.scroll();
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
            this.getMessages();
          },
        });
      this.message = "";
    }
  }

  readMessages(messageId) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
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
      if (this.isShowChat) {
        this.showItems();
      } else {
        this.hideItems();
      }
    }
    if (this.isShowChat) {
      const messages = this.messages.at();
      if (messages.fromUser !== this.fromUser) {
        this.readMessages(messages?.id);
      }
    }
    this.scroll();
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

  scroll() {
    setTimeout(() => {
      this.chatBody.nativeElement.scroll(0, 99999999);
    }, 500);
  }

  toggleChat() {
    this.selectedButton(this.options.buttons[1])
  }

  ngOnDestroy() {
    this.visitSvc.isHelpButtonShow = false;
  }
}
