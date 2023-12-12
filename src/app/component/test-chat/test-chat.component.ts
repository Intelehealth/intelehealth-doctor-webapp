import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChatService } from "src/app/services/chat.service";
import { SocketService } from "src/app/services/socket.service";
declare const getFromStorage;

@Component({
  selector: "app-test-chat",
  templateUrl: "./test-chat.component.html",
  styleUrls: ["./test-chat.component.css"],
})
export class TestChatComponent implements OnInit {
  @ViewChild("chatInput") chatInput: ElementRef;
  @ViewChild("chatBox") chatBox: ElementRef;
  data = {
    to: "9eb2dd7c-93f5-4578-8031-de1fcef1ac68",
    visitId: "95777c29-96cb-4988-bd4f-0cf45eed286b",
    from: "d7adbb20-86bf-4ea6-a080-e3bda47f200c",
    patientId: "fb7a23d2-0286-4481-8e60-4f79f736468f",
  };
  classFlag = false;
  chats = [];
  isUser;
  user_messages;
  message;
  patientId = null;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("patient_id");
    this.reInitSocket();
  }

  get activeUsers() {
    return Object.keys(this.socket.activeUsers);
  }

  reInitSocket() {
    localStorage.socketQuery = `userId=${this.data.from}&name=mobile`;
    this.socket.initSocket(true);
    this.socket.onEvent("updateMessage").subscribe(() => {
      this.updateMessages();
      this.playNotify();
    });
  }

  get chatElem() {
    return this.chatInput.nativeElement;
  }

  onsubmit() {
    if (this.message) {
      this.user_messages = {
        message: this.message,
        isUser: true,
      };
      this.chats.push(this.user_messages);
      this.message = "";
    }
  }

  get patientVisitProvider() {
    return getFromStorage("patientVisitProvider");
  }

  get toUser() {
    return this.patientVisitProvider?.provider?.uuid;
  }

  sendMessage(event) {
    if (
      this.data.to &&
      this.data.from &&
      this.data.patientId &&
      this.chatElem.value
    ) {
      this.chatService
        .sendMessage(
          this.data.to,
          this.data.patientId,
          this.chatElem.value,
          { ...this.data, fromUser: this.data.from }
        )
        .subscribe((res) => {
          this.updateMessages();
        });
    }
    this.chatElem.value = "";
  }

  updateMessages() {
    this.chatService
      .getPatientMessages(this.data.to, this.data.patientId, this.data.from)
      .subscribe((res: { data }) => {
        this.chats = res.data;
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
    }, 0);
  }

  playNotify() {
    new Audio("../../../../assets/notification.mp3").play();
  }
}

