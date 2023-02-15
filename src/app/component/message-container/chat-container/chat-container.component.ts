import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { ChatService } from "src/app/services/chat.service";
import * as moment from "moment";
import { SocketService } from "src/app/services/socket.service";

@Component({
  selector: "app-chat-container",
  templateUrl: "./chat-container.component.html",
  styleUrls: ["./chat-container.component.scss"],
})
export class ChatContainerComponent implements OnInit {
  @Input("latestChat") set getChat(latestChat) {
    this.latestChat = latestChat;
    this.visitId = this.latestChat.visitId;
    this.getMessages();

    if (this.latestChat?.fromUser !== this.fromUser) {
      this.readMessages(this.latestChat?.id);
    }
  }
  latestChat: any;

  @Output() onSubmit: EventEmitter<any> = new EventEmitter();
  message = "";
  fromUuid = null;
  visits: any = [];
  messageList: any;
  visitId: any;
  moment: any = moment;
  openMenu: boolean = false;
  isOver = false;
  readSentImg: any;

  constructor(private chatSvc: ChatService, private socketSvc: SocketService) { }

  ngOnInit(): void {
    this.visitId = this.latestChat?.visitId;
    // if (!this.isNewChat) {
    //   this.getPatientsVisits(this.latestChat?.patientId);
    // }
    //  this.getMessages();
    this.socketSvc.initSocket(true);
    this.socketSvc.onEvent("updateMessage").subscribe((data) => {
      this.socketSvc.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });

      this.readMessages(data.id);
      this.messageList = data.allMessages.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
    });

    this.socketSvc.onEvent("isread").subscribe((data) => {
      this.getMessages();
    });
  }

  submitMessage(event) {
    let value = event.target.value.trim();
    this.message = "";
    if (value.length < 1) return false;
    this.latestChat.latestMessage = value;
    this.latestChat.messages.unshift({
      id: 1,
      message: value,
      me: true,
    });
  }

  getPatientsVisits(patientId) {
    this.chatSvc.getPatientAllVisits(patientId).subscribe({
      next: (res: any) => {
        this.visits = res?.data;
      },
    });
  }

  onVisitChange(visitId) {
    this.visitId = visitId;
    this.getMessages();
  }

  getMessages() {
    this.chatSvc
      .getPatientMessages(
        this.toUserId,
        this.latestChat?.patientId,
        this.latestChat?.fromUser,
        this.visitId
      )
      .subscribe({
        next: (res: any) => {
          this.messageList = res?.data;
          this.getPatientsVisits(this.latestChat?.patientId);
        },
      });
  }

  get toUserId() {
    if (this.latestChat?.toUser === this.chatSvc?.user?.uuid) {
      return this.latestChat.fromUser;
    } else if (this.latestChat?.fromUser === this.chatSvc?.user?.uuid) {
      return this.latestChat?.toUser;
    } else {
      return null;
    }
  }

  readMessages(messageId) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  get patientName() {
    return localStorage.patientName || "";
  }

  clickMenu() {
    this.openMenu = !this.openMenu;
  }

  sendMessage() {
    if (this.message) {
      this.latestChat.latestMessage = this.message;

      const payload = {
        visitId: this.latestChat?.visitId,
        patientName: this.patientName,
        hwName: this.latestChat?.hwName,
      };

      this.chatSvc
        .sendMessage(
          this.latestChat?.toUser,
          this.latestChat?.patientId,
          this.message,
          payload
        )
        .subscribe({
          next: (res) => {
            this.getMessages();
          },
        });
      this.message = "";
    }
  }

  get fromUser() {
    return JSON.parse(localStorage.user).uuid;
  }
}
