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
    to: "a4ac4fee-538f-11e6-9cfe-86f436325720",
    from: "28cea4ab-3188-434a-82f0-055133090a38",
    patientId: "a286e0de-eba0-4ad5-b698-900657d8ac75",
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
          this.data.from
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
    new Audio("../../../../intelehealth/assets/notification.mp3").play();
  }
}

