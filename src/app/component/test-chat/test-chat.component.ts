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
    to: "88a18f3e-0a1d-4af6-b1b4-38b1ee7c5c2f",
    from: "30240f0b-7ea8-4e5e-87f8-eb29cd702f99",
    patientId: "757a9fa4-e86d-47e9-8a0a-d52decdab703",
    connectToDrId: '67bfd7f0-0508-11e3-8ffd-0800200c9a66',//dr 1 id by default to test,
    visitId: 'e215f705-9c11-4c3a-bca9-6bb1fcaff61c'
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
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("patient_id");
    this.reInitSocket();
  }

  get activeUsers() {
    return Object.keys(this.socket.activeUsers);
  }

  reInitSocket() {
    localStorage.socketQuery = `userId=${this.data.from}&name=mobile`;
    sessionStorage.webrtcDebug = 1;
    this.socket.initSocket();

    this.socket.onEvent("updateMessage").subscribe((data) => {
      this.updateMessages();
      this.chats = data.allMessages.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
    });

    this.socket.onEvent("isread").subscribe((data) => {
      this.updateMessages();
    });
  }

  get chatElem() {
    return this.chatInput.nativeElement;
  }

  onsubmit() {
    if (this.message) {
      console.log(this.message);
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
    return this.patientVisitProvider.provider.uuid;
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
          { visitId: this.data.visitId },
          this.data.from,
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

  callDoctor() {
    localStorage.patientUuid = this.data.patientId;
    localStorage.connectToDrId = this.data.connectToDrId;
    this.socket.openVcModal("hw");
  }
}
