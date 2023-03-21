import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';
import { SupportService } from 'src/app/services/support.service';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
  styleUrls: ['./help-menu.component.scss']
})
export class HelpMenuComponent implements OnInit {

  messages: any = [];
  message: string = "";

  constructor(private socketService: SocketService, private supportService: SupportService) { }

  ngOnInit(): void {
    this.getMessages();
    this.socketService.initSocketSupport(true);
    this.socketService.onEvent("supportMessage").subscribe((data) => {
      this.socketService.showNotification({
        title: "New message from support team",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });

      this.readMessagesSupport(data.id);
      this.messages= data.allMessages.sort((a: any, b: any) => new Date(b.createdAt) < new Date(a.createdAt) ? -1 : 1);
    });

    this.socketService.onEvent("isreadSupport").subscribe((data) => {
      this.getMessages();
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

  getMessages() {
    this.supportService.getSupportMessages(this.user.uuid, 'System Administrator')
      .subscribe({
        next: (res: any) => {
          if (res.success) {
            this.messages = res?.data;
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
    return JSON.parse(localStorage.user);
  }

}
