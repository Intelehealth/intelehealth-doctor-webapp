import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketService } from 'src/app/services/socket.service';
import { SupportService } from 'src/app/services/support.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { notifications } from 'src/config/constant';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
  styleUrls: ['./help-menu.component.scss']
})
export class HelpMenuComponent implements OnInit, OnDestroy {

  messages: any = [];
  message: string = "";
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private socketService: SocketService, private supportService: SupportService) { }

  ngOnInit(): void {
    this.getMessages(true);
    this.socketService.initSocketSupport(true);
    this.subscription1 = this.socketService.onEvent(notifications.SUPPORT_MESSAGE).subscribe((data) => {
      // this.socketService.showNotification({
      //   title: "New message from support team",
      //   body: data.message,
      //   timestamp: new Date(data.createdAt).getTime(),
      // });

      this.readMessagesSupport(data.id);
      this.messages= data.allMessages.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
    });

    this.subscription2 = this.socketService.onEvent(notifications.ISREAD_SUPPORT).subscribe((data) => {
      if (data.msgTo == 'System Administrator') {
        this.getMessages();
      }
    });
  }

  sendMessage() {
    if (this.message) {
      const payload = {
        type: 'text',
        message: this.message,
        from: this.user.uuid,
        to: 'System Administrator'
      };
      this.supportService.sendMessage(payload).subscribe((res: any) => {
        if (res.success) {
          this.message = "";
          this.getMessages();
        }
      });
    }
  }

  getMessages(init = false) {
    this.supportService.getSupportMessages(this.user.uuid, 'System Administrator')
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.messages = res?.data;
            if (init && this.messages.length) {
              let mid = this.messages.find(m => m.from == 'System Administrator')?.id;
              if (mid) {
                this.readMessagesSupport(mid);
              }
            }
          }
        },
      });
  }

  readMessagesSupport(messageId: any) {
    this.supportService.readMessageById(this.user?.uuid, messageId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.getMessages();
        }
      },
    });
  }

  get user() {
    return getCacheData(true,notifications.USER);
  }

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    this.subscription2?.unsubscribe();
  }

}
