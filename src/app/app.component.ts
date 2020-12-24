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
  introJS = introJs();
  specialization;
  newVisits;
  visitNote;
  readonly VapidKEY = 'BFwuhYcJpWKFnTewNm9XtBTycAV_qvBqvIfbALC02CtOaMeXwrO6Zhm7MI_NIjDV9_TCbrr0FMmaDnZ7jllV6Xg';
  constructor(public authService: AuthService,
              public sessionService: SessionService,
              // private userIdle: UserIdleService,
              public router: Router,
              public visitService: VisitService,
              public notificationService: PushNotificationsService,
              public swUpdate: SwUpdate,
              public swPush: SwPush) {}


  reloadCache() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm('New version available')) {
          window.location.reload();
        }
      });
    }
  }
  ngOnInit () {
    // this.userIdle.startWatching();
    // // Start watching when user idle is starting.
    // this.userIdle.onTimerStart().subscribe(count => {
    //   if (count === 1) {
    //     this.authService.logout();
    //     this.userIdle.stopWatching();
    //   }
    // });
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
    // setInterval(() => {
    //   this.visitService.getVisits()
    //   .subscribe(visists => {
    //     if (visists) {
    //       this.checkForNewOrUpdatedVisit(visists);
    //     } else {
    //       this.sessionService.loginSession(session).subscribe(response => {
    //         if (response.authenticated === true) {
    //           this.authService.sendToken(response.sessionId);
    //           saveToStorage('user', response.user);
    //         }
    //       });
    //     }
    //   });
    // }, 10000);
  }

  // checkForNewOrUpdatedVisit(response) {
  //   this.newVisits = [];
  //   this.visitNote = [];
  //   const visits = response.results;
  //   visits.forEach(active => {
  //     if (active.encounters.length) {
  //       if (active.attributes.length) {
  //         const visitAttributes = active.attributes;
  //         const speRequired = visitAttributes.filter(attr => attr.attributeType.uuid === '3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d');
  //         if (speRequired.length) {
  //           speRequired.forEach((spe, index) => {
  //             if (!spe.voided && spe.value === this.specialization) {
  //               if (index === 0) {
  //                 this.visitCategory(active);
  //               }
  //               if (index === 1 && spe[0] !== spe[1]) {
  //                 this.visitCategory(active);
  //               }
  //             }
  //           });
  //         }
  //       } else if (this.specialization === 'General Physician') {
  //         this.visitCategory(active);
  //       }
  //     }
  //   });
  //   if (this.newVisits.length > GlobalConstants.visits.length) {
  //     const newVisit = CheckNewVisit(this.newVisits, GlobalConstants.visits);
  //     newVisit.forEach(uq => {
  //       const data = {
  //         patientID: uq.data.patient.uuid,
  //         visitID: uq.data.uuid
  //       };
  //       GlobalConstants.visits = this.newVisits;
  //       this.notificationService.generateNotification(uq.data.patient.person.display, 'Click to open see Visit Summary', data);
  //     });
  //   } else if (this.newVisits.length < GlobalConstants.visits.length) {
  //     const seenVisit = CheckNewVisit(GlobalConstants.visits, this.newVisits);
  //     seenVisit.forEach(uq => {
  //       const visitNote = CheckVisitNote(uq, this.visitNote);
  //       const providerDetails = getFromStorage('provider');
  //       if (visitNote.length && visitNote[0].encounters[0].encounterProviders[0].provider.uuid !== providerDetails.uuid) {
  //         const data = {
  //           patientID: uq.data.patient.uuid,
  //           visitID: uq.data.uuid
  //         };
  //         this.notificationService.generateNotification(uq.data.patient.person.display, 'Seen by doctor', data);
  //       }
  //       GlobalConstants.visits = this.newVisits;
  //     });
  //   }
  // }

  // visitCategory(active) {
  //   const value = active.encounters[0].display;
  //   if (value.match('Flagged') || value.match('ADULTINITIAL') || value.match('Vitals')) {
  //     if (!active.encounters[0].voided) {
  //       this.newVisits.push(active);
  //     }
  //   } else if (value.match('Visit Note')) {
  //     if (!active.encounters[0].voided) {
  //       this.visitNote.push(active);
  //     }
  //   }
  // }

  receiveMessage() {
    let steps = [
      {
        // tslint:disable-next-line: max-line-length
        intro: 'Welcome to the Doctor portal. In less than 1 min, we will show you how to give diagnosis, medicines,test and advice to a patient.'
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
        intro: 'These are visits that are not provided with consultation.',
        position: 'left'
      },
      {
        element: '#visit-in-progress',
        intro: 'These are visits that are seen by the doctor and have been partially provided a consultation',
        position: 'right'
      },
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
        element: document.getElementById('patient-id'),
        intro: 'Click on patient id to add doctor\'s prescription for the patient.'
      },
      {
        element: '#logout-link',
        intro: 'Click on Logout to sign out from the portal.'
      },
      {
        intro: 'Great job, you have completed the tour.'
      }
    ];
    if (window.location.pathname.match('home') !== null) {
      this.introJS.setOptions({
        steps: steps,  showProgress: true,
            showBullets: false,
            skipLabel: 'Exit',
            doneLabel: 'Thanks',
      }).start();
    }
    if (window.location.pathname.match('visitSummary') !== null) {
      steps = [{
        element: '#past-visits',
        intro: 'Click on the visit date to see the patient record for that visit and schedule.'
      },
        {
        element: '#start-visit',
        intro: 'Click on start visit/here to write diagnosis, medications, tests, advice and follow up\'s',
      },
      {
        element: '#call-link',
        intro: 'Click on whatsapp or phone icon to speak to the patient ',
      },
      {
        element: '#patient-interaction',
        intro: 'Select yes or no and click on \'Submit\'',
      },
      {
        element: '#dropdown-diagnosis',
        intro: 'Write or choose from drop down options of diagnosis'
      },
      {
        element: '#primary-confirm',
        intro: 'Select from PRIMARY AND SECONDARY and from PROVISIONAL and CONFIRMED '
      },
      {
        element: '#diagnosis-submit',
        intro: 'Click on \'Add diagnosis\' to give diagnosis'
      },
      {
        element: '#doctor-notes',
        // tslint:disable-next-line: max-line-length
        intro: 'Write information such as reference notes, patients call notes etc and click on \'Add Note\'. These notes are not shared with the patient.'
      },
      {
        element: '#medication-form',
        // tslint:disable-next-line: max-line-length
        intro: 'Type the name of the medicines and choose from drop down options. If the name is not available on the drop down options you can type the name.'
      },
      {
        element: '#test-form',
        intro: 'Write or choose from drop down options of tests and click on \'Add Test\''
      },
      {
        element: '#advice-form',
        intro: 'Write or choose from drop down options of advise and then click on \'Add Advice\''
      },
      {
        element: '#followup-button',
        intro: 'Click on calender icon and select follow up date. Write remarks and click on \'Schedule a follow up\''
      },
      {
        element: '#sign-button',
        intro: 'Review the prescription and click on \'Sign and Submit\' to send the prescription to the health worker.'
      }
    ];
      this.introJS.setOptions({
        steps: steps,  showProgress: true,
            showBullets: false,
            skipLabel: 'Exit',
            doneLabel: 'Thanks',
      }).start();
    }
  }

}
