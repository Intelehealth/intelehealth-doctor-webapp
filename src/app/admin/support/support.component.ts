import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { SocketService } from 'src/app/services/socket.service';
import { SupportService } from 'src/app/services/support.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { environment } from 'src/environments/environment';
import { notifications, doctorDetails, languages } from 'src/config/constant'
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
    private socketSvc: SocketService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Support", imgUrl: "assets/svgs/menu-info-circle.svg" });
    this.getDoctorsList(this.userId);
    this.subscription1 = this.socketSvc.onEvent(notifications.SUPPORT_MESSAGE).subscribe((data) => {
      if (data.from == this.selectedConversation?.userUuid) {
        this.readMessages(data.id);
        this.messageList = data.allMessages.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
      } else {
        const doc = this.conversations.findIndex((d: any) => d.userUuid == data.from);
        if (doc == -1) {
          this.getDoctorsList(this.userId);
        } else {
          this.conversations[doc].createdAt = data.createdAt;
          this.conversations[doc].unread++;
          this.conversations.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1)
        }
      }
    });

    this.subscription2 = this.socketSvc.onEvent(notifications.ISREAD_SUPPORT).subscribe((data) => {
      if (data.msgTo == this.selectedConversation?.userUuid) {
        this.getMessages();
      }
    });
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
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

}
