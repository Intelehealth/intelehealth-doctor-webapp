import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { SocketService } from 'src/app/services/socket.service';
import { SupportService } from 'src/app/services/support.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { environment } from 'src/environments/environment';
import { notifications, doctorDetails, languages } from 'src/config/constant'
import { ApiResponseModel, ConversationModel, MessageModel } from 'src/app/model/model';
@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.scss']
})
export class SupportComponent implements OnInit, OnDestroy {
  conversations: ConversationModel[] = [];
  searchValue: string;
  baseURL = environment.baseURL;
  selectedConversation: ConversationModel;

  message = "";
  fromUuid = null;
  messageList: MessageModel[];
  openMenu: boolean = false;
  isOver = false;
  isAttachment = false;
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
        this.messageList = data.allMessages.sort((a: MessageModel, b: MessageModel) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
      } else {
        const doc = this.conversations.findIndex((d: ConversationModel) => d.userUuid == data.from);
        if (doc == -1) {
          this.getDoctorsList(this.userId);
        } else {
          this.conversations[doc].createdAt = data.createdAt;
          this.conversations[doc].unread++;
          this.conversations.sort((a: ConversationModel, b: ConversationModel) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1)
        }
      }
    });

    this.subscription2 = this.socketSvc.onEvent(notifications.ISREAD_SUPPORT).subscribe((data) => {
      if (data.msgTo == this.selectedConversation?.userUuid) {
        this.getMessages();
      }
    });
  }

  /**
  * Get filtered conversations based on doctor name or user uuid.
  * @return {void}
  */
  get filteredConversations() {
    return this.conversations.filter((conversation: ConversationModel) => {
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

  /**
  * Get doctors list/ conversations.
  * @param {string} userUuid - User uuid of the logged-in doctor
  * @return {void}
  */
  getDoctorsList(userUuid: string) {
    this.supportService.getDoctorsList(userUuid).subscribe({
      next: (res: ApiResponseModel) => {
        if (res.success) {
          this.conversations = res.data;
        }
      },
    });
  }

  /**
  * Select conversation.
  * @param {ConversationModel} conversation - Conversation to select
  * @return {void}
  */
  conversationSelected(conversation: ConversationModel) {
    this.selectedConversation = conversation;
    this.getMessages();
    this.readMessages(this.selectedConversation?.id);
    this.selectedConversation.unread = 0;
  }

  /**
  * Get all messages for the selected conversation.
  * @return {void}
  */
  getMessages() {
    this.supportService.getSupportMessages(this.userId, this.selectedConversation?.userUuid)
      .subscribe({
        next: (res: ApiResponseModel) => {
          if (res.success) {
            this.messageList = res?.data;
          }
        },
      });
  }


  /**
  * Update message status to read using message id.
  * @param {number} messageId - Message id
  * @return {void}
  */
  readMessages(messageId: number) {
    this.supportService.readMessageById(this.userId, messageId).subscribe({
      next: (res) => {
        this.getMessages();
      },
    });
  }

  /**
  * Send a message.
  * @return {void}
  */
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

  /**
  * Get user uuid from localstorage user
  * @return {string} - User uuid
  */
  get userId(): string {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

}
