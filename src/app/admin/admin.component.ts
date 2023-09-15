import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';
import { notifications } from 'src/config/constant';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit, OnDestroy {

  subscription1: Subscription;
  interval: any;

  constructor(private socketSvc: SocketService) { }

  ngOnInit(): void {
    this.socketSvc.initSocketSupport(true);
    this.subscription1 = this.socketSvc.onEvent(notifications.ADMIN_UNREAD_COUNT).subscribe((data) => {
      this.socketSvc.addCount(data);
    });
    setTimeout(() => {
      this.socketSvc.emitEvent(notifications.GET_ADMIN_UNREAD_COUNT, null);
    }, 1500);
    this.interval = setInterval(() => {
      this.socketSvc.emitEvent(notifications.GET_ADMIN_UNREAD_COUNT, null);
    }, 30000);
  }

  ngOnDestroy(): void {
    this.subscription1?.unsubscribe();
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}
