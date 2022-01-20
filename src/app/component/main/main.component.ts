import { Component, OnInit } from '@angular/core';
import * as introJs from 'intro.js/intro.js';
import { Router } from '@angular/router';
// import { GlobalConstants } from './js/global-constants';
import { SwPush, SwUpdate } from '@angular/service-worker';
import { VisitService } from 'src/app/services/visit.service';
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from 'src/app/services/session.service';
import { PushNotificationsService } from 'src/app/services/push-notification.service';
import { TranslateService } from '@ngx-translate/core';
declare var getFromStorage: any, saveToStorage: any;
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
    public swPush: SwPush,
    public translate: TranslateService) { }


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
          intro: this.translate.instant('helpMsg1')
        },
        {
          element: '#navbarDropdownMenuLink-4',
          intro: this.translate.instant('helpMsg2')
        },
        {
          element: '#flagged-table',
          // tslint:disable-next-line: max-line-length
          intro: this.translate.instant('helpMsg3'),
          position: 'right'
        },
        {
          element: '#queued-table',
          intro: this.translate.instant('helpMsg4'),
          position: 'left'
        },
        {
          element: '#visit-in-progress',
          intro: this.translate.instant('helpMsg5'),
          position: 'right'
        },
        {
          element: '#visit-complete',
          intro: this.translate.instant('helpMsg5'),
          position: 'left'
        },
        {
          element: '#search-patient',
          intro: this.translate.instant('helpMsg7'),
          position: 'bottom'
        },
        {
          element: document.getElementById('columns-sorting'),
          intro: this.translate.instant('helpMsg8')
        },
        {
          element: document.getElementById('patient-id'),
          intro: this.translate.instant('helpMsg9')
        },
        {
          element: '#logout-link',
          intro: this.translate.instant('helpMsg10')
        },
        {
          intro: this.translate.instant('helpMsg11')
        }
      ];
      if (window.location.hash.match('home') !== null) {
        this.introJS.setOptions({
          steps: steps, showProgress: true,
          showBullets: false,
          nextLabel: this.translate.instant('Next'),
          prevLabel: this.translate.instant('Back'),
          skipLabel: this.translate.instant('Exit'),
          doneLabel: this.translate.instant('Thanks'),
        }).start();
      }
      if (window.location.hash.match('visitSummary') !== null) {
        steps = [{
          element: '#past-visits',
          intro: this.translate.instant('helpMsg12')
        },
        {
          element: '#start-visit',
          intro: this.translate.instant('helpMsg13'),
        },
        {
          element: '#call-link',
          intro: this.translate.instant('helpMsg14'),
        },
        {
          element: '#patient-interaction',
          intro: this.translate.instant('helpMsg15'),
        },
        {
          element: '#dropdown-diagnosis',
          intro: this.translate.instant('helpMsg16')
        },
        {
          element: '#primary-confirm',
          intro: this.translate.instant('helpMsg17')
        },
        {
          element: '#diagnosis-submit',
          intro: this.translate.instant('helpMsg18')
        },
        {
          element: '#doctor-notes',
          // tslint:disable-next-line: max-line-length
          intro: this.translate.instant('helpMsg19')
        },
        {
          element: '#medication-form',
          // tslint:disable-next-line: max-line-length
          intro: this.translate.instant('helpMsg20')
        },
        {
          element: '#test-form',
          intro: this.translate.instant('helpMsg21')
        },
        {
          element: '#advice-form',
          intro: this.translate.instant('helpMsg22')
        },
        {
          element: '#followup-button',
          intro: this.translate.instant('helpMsg23')
        },
        {
          element: '#sign-button',
          intro: this.translate.instant('helpMsg24')
        }
        ];
        this.introJS.setOptions({
          steps: steps, showProgress: true,
          showBullets: false,
          skipLabel: this.translate.instant('Exit'),
          doneLabel: this.translate.instant('Thanks'),
        }).start();
      }
    }
  }
