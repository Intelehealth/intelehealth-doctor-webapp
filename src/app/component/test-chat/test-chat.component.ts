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
    from: "5a700f00-eca8-4fe2-bbbd-a2d4e5c3622a",
    patientId: "e5ec6a24-c350-4f66-a991-f0610962996b",
    connectToDrId: '67bfd7f0-0508-11e3-8ffd-0800200c9a66'//dr 1 id by default to test
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
    return this.socket.activeUsers;
  }

  reInitSocket() {
    localStorage.socketQuery = `userId=${this.data.from}&name=mobile`;
    this.socket.initSocket(true);
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

  callDoctor() {
    localStorage.patientUuid = this.data.patientId;
    localStorage.connectToDrId = this.data.connectToDrId;

    this.socket.emitEvent("create_or_join_hw", {
      patientId: this.data.patientId,
      connectToDrId: this.data.connectToDrId,
      visitId: "test-visit-uuid",
      nurseName: 'Zee Test Nurse',
      patientName: "Test Chat Patient",
      patientPersonUuid: 'testuuid',
      patientOpenMrsId: 'TESTID-12',
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2aWRlbyI6eyJyb29tSm9pbiI6dHJ1ZSwicm9vbSI6IjkyYTZkNTkwLWMyNGItNDUwZi05ODhjLThlZjliOWQyMzIxNyIsImNhblB1Ymxpc2giOnRydWUsImNhblN1YnNjcmliZSI6dHJ1ZSwiZXhwIjoiMTAgZGF5cyJ9LCJpYXQiOjE2ODg1NTM2MTEsIm5iZiI6MTY4ODU1MzYxMSwiZXhwIjoxNjg4NTc1MjExLCJpc3MiOiJkZXZrZXkiLCJzdWIiOiI1YTcwMGYwMC1lY2E4LTRmZTItYmJiZC1hMmQ0ZTVjMzYyMmEiLCJqdGkiOiI1YTcwMGYwMC1lY2E4LTRmZTItYmJiZC1hMmQ0ZTVjMzYyMmEifQ.o_xm9r7-f3sOcC3RZSyIo_Y2UiCFY4yo8budIetUPJo"
    });
  }
}
