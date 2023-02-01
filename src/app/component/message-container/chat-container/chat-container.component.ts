import { Component, OnInit, EventEmitter, Input, Output } from "@angular/core";
import { ChatService } from "src/app/services/chat.service";
import * as moment from "moment";

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

  constructor(private chatSvc: ChatService) {}

  ngOnInit(): void {
    this.visitId = this.latestChat?.visitId;
    // if (!this.isNewChat) {
    //   this.getPatientsVisits(this.latestChat?.patientId);
    // }
    //  this.getMessages();
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

  get patientName() {
    return localStorage.patientName || "";
  }

  get readSentLabel() {
    if (this.latestChat?.isRead) {
      return "Read";
    }
    return "Sent";
  }

  get readSentIcon() {
    if (this.latestChat?.isRead) {
      return "assets/svgs/read.svg"
    }
    return "assets/svgs/sent-msg.svg"
  }

  clickMenu() {
    this.openMenu = !this.openMenu;
  }

  sendMessage() {
    if (this.message) {
      this.latestChat.latestMessage = this.message;

      // this.latestChat.messages.unshift({
      //   id: 1,
      //   message: this.message,
      //   me: true,
      // });
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
            console.log("res: ", res);
            this.updateMessages(this.latestChat.toUuid);
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

  updateMessages(toUuid) {
    this.chatSvc.getAllMessages(toUuid).subscribe({
      next: (res: { data }) => {
        //this.latestChat = res.data;
        // var newArray = this.latestChat.messages.map((obj)=> {
        //   return { message: res.data.message };
        // });
        // console.log('newArray: ', newArray);
        console.log("res.data: ", res.data);
      },
      error: (err) => {
        console.log("err:>>>> ", err);
      },
      complete: () => {},
    });
  }
}
