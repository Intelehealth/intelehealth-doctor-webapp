import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ChatService } from 'src/app/services/chat.service';
import { CoreService } from 'src/app/services/core/core.service';
import { SocketService } from 'src/app/services/socket.service';
import { WebrtcService } from 'src/app/services/webrtc.service';
import { environment } from 'src/environments/environment';
import { WEBRTC } from 'src/config/constant';

@Component({
  selector: 'app-chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.scss']
})
export class ChatBoxComponent implements OnInit, OnDestroy {

  message: string;
  messageList: any = [];
  hwName: any;
  isAttachment = false;
  baseUrl: string = environment.baseURL;
  defaultImage = 'assets/images/img-icon.jpeg';
  pdfDefaultImage = 'assets/images/pdf-icon.png';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  sending = false;
  CHAT_TEXT_LIMIT = WEBRTC.CHAT_TEXT_LIMIT;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ChatBoxComponent>,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private coreService: CoreService,
    private webrtcSvc: WebrtcService,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {
    const patientVisitProvider = JSON.parse(localStorage.getItem("patientVisitProvider"));
    await this.webrtcSvc.updateVisitHolderId(this.data.visitId);
    this.hwName = patientVisitProvider?.display?.split(":")?.[0];
    if (this.data.patientId && this.data.visitId) {
      this.getMessagesAndCheckRead();
    }
    // this.socketSvc.initSocket(true);
    this.socketSvc.updateMessage = true;
    this.subscription1 = this.socketSvc.onEvent("updateMessage").subscribe((data) => {
      if (this.socketSvc.updateMessage) {
        this.readMessages(data.id);
      }
    });
    this.subscription3 = this.socketSvc.onEvent("msg_delivered").subscribe((data) => {
      this.getMessages();
    });

    this.subscription2 = this.socketSvc.onEvent("isread").subscribe((data) => {
      this.getMessages();
    });
  }

  get toUser() {
    const patientVisitProvider = JSON.parse(localStorage.getItem("patientVisitProvider"));
    return this.webrtcSvc.visitHolderId || patientVisitProvider?.provider?.uuid;
  }

  getMessagesAndCheckRead(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId, isFirstTime = false) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messageList = res?.data;
          const msg = this.messageList[0];
          if (msg && !msg?.isRead && msg?.fromUser !== this.fromUser) {
            this.readMessages(this.messageList[0].id);
          }
        },
      });
  }

  getMessages(toUser = this.toUser, patientId = this.data.patientId, fromUser = this.fromUser, visitId = this.data.visitId, isFirstTime = false) {
    this.chatSvc
      .getPatientMessages(toUser, patientId, fromUser, visitId)
      .subscribe({
        next: (res: any) => {
          this.messageList = res?.data;
        },
      });
  }

  async sendMessage() {
    await this.webrtcSvc.updateVisitHolderId(this.data.visitId);

    if (this.message) {
      const nursePresent: any = this.socketSvc.activeUsers.find(u => u?.uuid === this.webrtcSvc.visitHolderId);
      if (!nursePresent) {
        this.toastr.error("Please try again later.", "Health Worker is not Online.");
        return;
      }

      if (this.msgCharCount > this.CHAT_TEXT_LIMIT) {
        this.toastr.error(`Reduce to ${this.CHAT_TEXT_LIMIT} characters or less.`, `Length should not exceed ${this.CHAT_TEXT_LIMIT} characters.`);
        return;
      }

      const payload = {
        visitId: this.data.visitId,
        patientName: this.data.patientName,
        hwName: this.hwName,
        type: this.isAttachment ? 'attachment' : 'text'
      };
      this.sending = true;
      this.chatSvc
        .sendMessage(this.toUser, this.data.patientId, this.message, payload)
        .subscribe({
          next: (res) => {
            this.isAttachment = false;
            this.getMessages();
            setTimeout(() => { this.sending = false; }, 500);
          },
          error: () => {
            this.isAttachment = false;
          },
          complete: () => {
            this.isAttachment = false;
          }
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

  get fromUser() {
    return JSON.parse(localStorage.user).uuid;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  isPdf(url) {
    return url.includes('.pdf');
  }

  uploadFile(files) {
    this.chatSvc.uploadAttachment(files, this.messageList).subscribe({
      next: (res: any) => {
        this.isAttachment = true;

        this.message = res.data;
        this.sendMessage();
      }
    });
  }

  setImage(src) {
    this.coreService.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
  }

  get msgCharCount() {
    return this.message?.length || 0
  }

  ngOnDestroy() {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
    this.subscription3?.unsubscribe();
    this.dialogRef.close();
    this.socketSvc.updateMessage = false;
  }

}
