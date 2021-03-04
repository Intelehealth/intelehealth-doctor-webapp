import { SessionService } from './services/session.service';
import { VisitService } from './services/visit.service';
import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserIdleService } from 'angular-user-idle';
import * as introJs from 'intro.js/intro.js';
import { Router } from '@angular/router';
import { PushNotificationsService } from './services/push-notification.service';
import { GlobalConstants } from './js/global-constants';
import { SwPush, SwUpdate } from '@angular/service-worker';
declare var CheckNewVisit: any, CheckVisitNote: any, getFromStorage: any, saveToStorage: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  ngOnInit () {   
  }

}
