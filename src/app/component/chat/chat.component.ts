import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ChatService } from "src/app/services/chat.service";
import { SocketService } from "src/app/services/socket.service";

declare const getFromStorage, navigator: any;
@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"],
})
export class ChatComponent implements OnInit {
  @ViewChild("chatInput") chatInput: ElementRef;
  @ViewChild("chatBox") chatBox: ElementRef;

  classFlag = false;
  chats = [];
  isUser;
  user_messages;
  message;
  patientId = null;
  visitId = null;
  loading = true;
  isOnline = navigator.onLine;

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute,
    private socket: SocketService
  ) {}

  @HostListener("window:online", ["$event"])
  online() {
    console.log("online");
    this.isOnline = true;
  }
  @HostListener("window:offline", ["$event"])
  offline() {
    console.log("offline");
    this.isOnline = false;
  }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("patient_id");
    this.visitId = this.route.snapshot.paramMap.get("visit_id");
    localStorage.socketQuery = `userId=${this.userUuid}&name=${this.userName}`;
    this.initSocket();
    this.chatService.popUpCloseEmitter.subscribe((data: any) => {
      if (data && data.type === "videoCall") this.initSocket();
    });
  }

  initSocket(force = true) {
    this.updateMessages();
    this.socket.initSocket(force);
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
      this.loading = true;
      this.chatService
        .sendMessage(this.toUser, this.patientId, this.chatElem.value, {
          visitId: this.visitId,
          patientName: localStorage.patientName,
        })
        .subscribe({
          next: (res) => {
            this.updateMessages();
          },
          error: () => {
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          },
        });
    }
    this.chatElem.value = "";
  }

  updateMessages() {
    this.chatService.getPatientMessages(this.toUser, this.patientId).subscribe({
      next: (res: { data }) => {
        this.chats = res.data;
        this.loading = false;
        this.scroll();
      },
      error: (err) => {
        console.log("err:>>>> ", err);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onPressEnter(e) {
    if (e?.target?.value && e?.key === "Enter") {
      this.sendMessage(e);
    }
  }

  chatLaunch() {
    this.classFlag = true;
    this.initSocket();
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
    new Audio("assets/notification.mp3").play();
  }
}
