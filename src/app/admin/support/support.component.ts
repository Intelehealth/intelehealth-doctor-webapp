import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { SocketService } from 'src/app/services/socket.service';
import { SupportService } from 'src/app/services/support.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {
  conversations: any = [];
  searchValue: string;
  baseURL = environment.baseURL;
  searchResults: any = [];
  selectedConversation: any;

  message = "";
  fromUuid = null;
  messageList: any;
  openMenu: boolean = false;
  isOver = false;
  isAttachment = false;
  readSentImg: any;
  images: any = {};
  defaultImage = 'assets/images/img-icon.jpeg';
  pdfDefaultImage = 'assets/images/pdf-icon.png';
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(
    private pageTitleService: PageTitleService,
    private supportService: SupportService,
    private socketSvc: SocketService
  ) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Support", imgUrl: "assets/svgs/menu-info-circle.svg" });
    this.getDoctorsList(this.userId);
    // this.socketSvc.initSocketSupport(true);
    this.subscription1 = this.socketSvc.onEvent("supportMessage").subscribe((data) => {
      this.socketSvc.showNotification({
        title: "New chat message for support",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });

      if (data.from == this.selectedConversation?.userUuid) {
        this.readMessages(data.id);
        this.messageList = data.allMessages.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
      } else {
        const doc = this.conversations.findIndex((d: any) => d.userUuid == data.from);
        if (doc == -1) {
          this.getDoctorsList(this.userId);
        } else {
          this.conversations[doc].message = data.message;
          this.conversations[doc].unread++;
          this.conversations.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1)
        }
      }
    });

    this.subscription2 = this.socketSvc.onEvent("isreadSupport").subscribe((data) => {
      if (data.msgTo == this.selectedConversation?.userUuid) {
        this.getMessages();
      }
    });
  }

  search() {

  }

  get filteredConversations() {
    return this.conversations.filter((conversation: any) => {
      return (
        conversation?.doctorName
          .toLowerCase()
          .includes(this.searchValue.toLowerCase()) ||
        conversation?.userUuid
          .toLowerCase()
          .includes(this.searchValue.toLowerCase())
      );
    });
  }

  getDoctorsList(userUuid: string) {
    this.supportService.getDoctorsList(userUuid).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.conversations = res.data;
        }
      },
    });
  }

  conversationSelected(conversation: any) {
    this.selectedConversation = conversation;
    this.getMessages();
    this.readMessages(this.selectedConversation?.id);
    this.selectedConversation.unread = 0;
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  // submitMessage(event) {
  //   let value = event.target.value.trim();
  //   this.message = "";
  //   if (value.length < 1) return false;
  //   this.selectedConversation.latestMessage = value;
  //   this.selectedConversation.messages.unshift({
  //     id: 1,
  //     message: value,
  //     me: true,
  //   });
  // }

  getMessages() {
    this.supportService.getSupportMessages(this.userId, this.selectedConversation?.userUuid)
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.messageList = res?.data;
          }
        },
      });
  }

  readMessages(messageId: any) {
    this.supportService.readMessageById(this.userId, messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  sendMessage() {
    if (this.message) {
      this.selectedConversation.message = this.message;
      const payload = {
        type: 'text',
        message: this.message,
        from: this.userId,
        to: this.selectedConversation.userUuid
      };

      this.supportService
        .sendMessage(
          payload
        )
        .subscribe({
          next: (res) => {
            if (res.success) {
              this.isAttachment = false;
              this.message = "";
              this.getMessages();
            }
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

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  // setImage(src) {
  //   this.coreService.openImagesPreviewModal({ startIndex: 0, source: [{ src }] }).subscribe();
  // }

  // isPdf(url) {
  //   return url.includes('.pdf');
  // }

  // uploadFile(files) {
  //   this.chatSvc.uploadAttachment(files, this.messageList).subscribe({
  //     next: (res: any) => {
  //       this.isAttachment = true;

  //       this.message = res.data;
  //       this.sendMessage();
  //     }
  //   })
  // }

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

}
