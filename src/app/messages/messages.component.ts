import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { ChatService } from '../services/chat.service';
import { SocketService } from '../services/socket.service';
import { CoreService } from '../services/core/core.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  conversations: any;
  searchValue: string;
  baseURL = environment.baseURL;
  searchResults: any = [];
  selectedConversation: any;

  message = "";
  fromUuid = null;
  visits: any = [];
  messageList: any;
  visitId: any;
  openMenu: boolean = false;
  isOver = false;
  isAttachment = false;
  readSentImg: any;
  images: any = {};
  defaultImage = 'assets/images/img-icon.jpeg';
  pdfDefaultImage = 'assets/images/pdf-icon.png';

  constructor(
    private pageTitleService: PageTitleService,
    private chatSvc: ChatService,
    private socketSvc: SocketService,
    private coreService: CoreService,
  ) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Messages", imgUrl: "assets/svgs/menu-message-circle.svg" });
    this.getPatientsList(this.chatSvc?.user?.uuid);
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

  search() {

  }

  get filteredConversations() {
    return this.conversations.filter((conversation: any) => {
      return (
        conversation?.patientName
          .toLowerCase()
          .includes(this.searchValue.toLowerCase()) ||
        conversation?.message
          .toLowerCase()
          .includes(this.searchValue.toLowerCase())
      );
    });
  }

  getPatientsList(drUuid) {
    this.chatSvc.getPatientList(drUuid).subscribe({
      next: (res: any) => {
        this.conversations = res.data;
      },
    });
  }

  get patientPic() {
    if (!this.conversations.patientPic) {
      return "assets/svgs/user.svg";
    }
    return this.conversations.patientPic;
  }

  conversationSelected(conversation: any) {
    this.selectedConversation = conversation;
    this.visitId = this.selectedConversation?.visitId;
    this.getMessages();
    if (this.selectedConversation?.fromUser !== this.fromUser) {
      this.readMessages(this.selectedConversation?.id);
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  submitMessage(event) {
    let value = event.target.value.trim();
    this.message = "";
    if (value.length < 1) return false;
    this.selectedConversation.latestMessage = value;
    this.selectedConversation.messages.unshift({
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
    this.chatSvc.getPatientMessages(this.toUserId, this.selectedConversation?.patientId, this.selectedConversation?.fromUser, this.visitId)
      .subscribe({
        next: (res: any) => {
          this.messageList = res?.data;
          this.getPatientsVisits(this.selectedConversation?.patientId);
        },
      });
  }

  get toUserId() {
    if (this.selectedConversation?.toUser === this.chatSvc?.user?.uuid) {
      return this.selectedConversation.fromUser;
    } else if (this.selectedConversation?.fromUser === this.chatSvc?.user?.uuid) {
      return this.selectedConversation?.toUser;
    } else {
      return null;
    }
  }

  readMessages(messageId: any) {
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
      this.selectedConversation.latestMessage = this.message;

      const payload = {
        visitId: this.selectedConversation?.visitId,
        patientName: this.patientName,
        hwName: this.selectedConversation?.hwName,
        type: this.isAttachment ? 'attachment' : 'text'
      };

      this.chatSvc
        .sendMessage(
          this.selectedConversation?.toUser,
          this.selectedConversation?.patientId,
          this.message,
          payload
        )
        .subscribe({
          next: (res) => {
            this.isAttachment = false;
            this.getMessages();
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

  get fromUser() {
    return JSON.parse(localStorage.user).uuid;
  }

  setImage(src) {
    this.coreService.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
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
    })
  }

}
