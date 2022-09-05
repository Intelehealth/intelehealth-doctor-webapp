import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChatService } from "src/app/services/chat.service";
import { SocketService } from "src/app/services/socket.service";
import { environment } from "src/environments/environment";
declare const getFromStorage;
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit {
  @ViewChild("chatInput") chatInput: ElementRef;
  @ViewChild("chatBox") chatBox: ElementRef;

  classFlag = false;
  setSpiner = true;
  chats = [];
  isUser;
  user_messages;
  message;
  patientId = null;
  visitId = null;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("patient_id");
    this.visitId = this.route.snapshot.paramMap.get("visit_id");
    localStorage.socketQuery = `userId=${this.userUuid}&name=${this.userName}`;
    this.updateMessages();
    this.socket.initSocket(true);
    this.socket.onEvent("updateMessage").subscribe((data) => {
      this.updateMessages();
      this.playNotify();
    });
  }

  get chatElem() {
    return this.chatInput.nativeElement;
  }

  get patientVisitProvider() {
    return getFromStorage("patientVisitProvider");
  }

  get toUser() {
    return this.patientVisitProvider.provider.uuid;
  }

  sendMessage(event) {
    if (this.toUser && this.patientId && this.chatElem.value) {
      this.setSpiner = true;
      this.chatService
        .sendMessage(this.toUser, this.patientId, this.chatElem.value, {
          visitId: this.visitId,
          patientName: localStorage.patientName,
        })
        .subscribe((res) => {
          this.updateMessages();
        });
    }
    this.chatElem.value = "";
  }

  updateMessages() {
    this.chatService
      .getPatientMessages(this.toUser, this.patientId)
      .subscribe((res: { data }) => {
        this.chats = res.data;
        this.setSpiner = false;
        this.scroll();
      });
  }

  onPressEnter(e) {
    if (e?.target?.value && e?.key === "Enter") {
      this.sendMessage(e);
    }
  }

  chatLaunch() {
    this.classFlag = true;
    this.scroll();
  }
  chatClose() {
    this.classFlag = false;
  }

  scroll() {
    setTimeout(() => {
      this.chatBox.nativeElement.scroll(0, 99999999);
    }, 500);
  }

  get userUuid() {
    return this.chatService.user.uuid;
  }

  get userName() {
    return this.chatService.user.display;
  }

  playNotify() {
    const src = environment.production
      ? "../../../../intelehealth/assets/notification.mp3"
      : "../../../../assets/notification.mp3";
    new Audio(src).play();
  }
}