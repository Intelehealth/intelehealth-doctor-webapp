import { Component, OnInit } from '@angular/core';
import { UserIdleService } from 'angular-user-idle';
import * as introJs from 'intro.js/intro.js';
import { Router } from '@angular/router';
// import { GlobalConstants } from './js/global-constants';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { VisitService } from 'src/app/services/visit.service';
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from 'src/app/services/session.service';
import { PushNotificationsService } from 'src/app/services/push-notification.service';
declare var CheckNewVisit: any, CheckVisitNote: any, getFromStorage: any, saveToStorage: any;
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  introJS = introJs();
  specialization;
  newVisits;
  visitNote;
  readonly VapidKEY = 'BFwuhYcJpWKFnTewNm9XtBTycAV_qvBqvIfbALC02CtOaMeXwrO6Zhm7MI_NIjDV9_TCbrr0FMmaDnZ7jllV6Xg';
  constructor(
    public authService: AuthService,
    public sessionService: SessionService,
    // private userIdle: UserIdleService,
    public router: Router,
    public visitService: VisitService,
    public notificationService: PushNotificationsService,
    public swUpdate: SwUpdate,
    public swPush: SwPush) { }


  reloadCache() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('New version available')) {
          window.location.reload();
        }
      });
    }
  }

  ngOnInit(): void {
    this.reloadCache();
    const session = getFromStorage('session');
    const providerDetails = getFromStorage('provider');
    if (session) {
      this.sessionService.loginSession(session).subscribe(response => {
        if (response.authenticated === true) {
          // this.router.navigate(['/home']);
          this.authService.sendToken(response.sessionId);
          saveToStorage('user', response.user);
        }
      });
    }
    if (providerDetails) {
      const attributes = providerDetails.attributes;
      attributes.forEach(element => {
        if (element.attributeType.uuid === 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !element.voided) {
          this.specialization = element.value;
        }
      });
    }
  }

    receiveMessage() {
      let steps = [
        {
          // tslint:disable-next-line: max-line-length
          intro: 'Welcome to the Doctor portal. In less than 1 min, we will show you how to check labour status and give consultation to a patient.'
        },
        {
          element: '#navbarDropdownMenuLink-4',
          intro: 'Click here to edit your profile or change your password.'
        },
        {
          element: '#flagged-table',
          // tslint:disable-next-line: max-line-length
          intro: 'These are visits that are marked as priority by health worker. Tip - Always provide consultation for priority visit table first.',
          position: 'right'
        },
        {
          element: '#queued-table',
          intro: 'These are visits that are normal and not provided with consultation.',
          position: 'left'
        },
        // {
        //   element: '#visit-in-progress',
        //   intro: 'These are visits that are seen by the doctor and have been partially provided a consultation',
        //   position: 'right'
        // },
        {
          element: '#visit-complete',
          intro: 'All visits that are seen by the doctor',
          position: 'left'
        },
        {
          element: '#search-patient',
          intro: 'Type patients name, id to search a patient.',
          position: 'bottom'
        },
        {
          element: document.getElementById('columns-sorting'),
          intro: 'Click on the headings of the table to sort.'
        },
        {
          element: '#patient-id',
          intro: 'Click on anywhere on row to add doctor\'s consultation for the patient.'
        },
        {
          element: '#logout-link',
          intro: 'Click on Logout to sign out from the portal.'
        },
        {
          intro: 'Great job, you have completed the tour.'
        }
      ];
      if (window.location.hash.match('home') !== null) {
        this.introJS.setOptions({
          steps: steps, showProgress: true,
          showBullets: false,
          skipLabel: 'Exit',
          doneLabel: 'Thanks',
        }).start();
      }
      if (window.location.hash.match('visitSummary') !== null) {
        steps = [{
          element: '#save',
          intro: 'Click on the plus button to write the patient assessment and plan for each hour.'
        },
        {
          element: '#zoom',
          intro: 'Click on plus icon to zoom in and minus icon to zoom out the epartogram ',
          position: 'right'

        },
        {
          element: '#whatsappBtn',
          intro: 'Click on whatsapp icon to share epartogram with health worker ',
        },
        {
          element: '#printPageButton',
          intro: 'Click on print icon to save or print the epartogram',
        },
        {
          element: '#vcButton',
          intro: 'Click on video icon to perform video call with health worker'
        },
        {
          element: '#chat-button',
          intro: 'Click on chat icon to chat with health worker'
        },
        {
          intro: 'Great job, you have completed the epartogram tour.'
        }
        ];
        this.introJS.setOptions({
          steps: steps, showProgress: true,
          showBullets: false,
          skipLabel: 'Exit',
          doneLabel: 'Thanks',
        }).start();
      }
    }
  }
