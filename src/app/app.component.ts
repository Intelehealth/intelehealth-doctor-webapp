import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { UserIdleService } from 'angular-user-idle';
import * as introJs from 'intro.js/intro.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  introJS = introJs();
  constructor(public authService: AuthService,
              private userIdle: UserIdleService,
              public router: Router) { }

  ngOnInit () {
    this.userIdle.startWatching();
    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => {
      if (count === 1) {
        this.authService.logout();
        this.userIdle.stopWatching();
      }
      });
  }

  receiveMessage() {
    let steps = [
      {
        // tslint:disable-next-line: max-line-length
        intro: 'Welcome to  Doctor portal. In less than 1 min, we will show you how to give diagnosis, medicines,test and advises to the patient.'
      },
      {
        element: '#navbarDropdownMenuLink-4',
        intro: 'Click here to enter your profile or change your password.'
      },
      {
        element: '#flagged-table',
        // tslint:disable-next-line: max-line-length
        intro: 'These are visits that are marked as emergency by Healthworker. Tip -  Always provided visits in  the flagged visits table first.',
        position: 'right'
      },
      {
        element: '#queued-table',
        intro: 'These are visits that are not provided with prescriptions.',
        position: 'left'
      },
      {
        element: '#visit-in-progress',
        intro: 'These are visits that are seen by doctor and have partially provided with prescriptions',
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
        intro: 'Click on patient id to give prescription to the patient.'
      },
      {
        element: '#logout-link',
        intro: 'Click on Logout to sign out from the portal.'
      },
      {
        intro: 'Great Job,you have completed the tour.'
      }
    ];
    if (window.location.href.split('#/')[1].match('home') !== null) {
      this.introJS.setOptions({
        steps: steps,  showProgress: true,
            showBullets: false,
            skipLabel: 'Exit',
            doneLabel: 'Thanks',
      }).start();
    }
    if (window.location.href.split('#/')[1].match('patientSummary') !== null) {
      steps = [{
        element: '#start-visit',
        intro: 'Click on start visit/here to write diagnosis, medications, tests,advises and follow up\'s',
      },
      {
        element: '#whatsapp-link',
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
        intro: 'Write information such as reference notes, patients call notes etc and click on \'Add Note\''
      },
      {
        element: '#medication-form',
        intro: 'Write medicines name or choose from drop down option.'
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
        intro: 'Click on calender icon and select follow up dates.Write comments and  click on \'Schedule a follow up date\''
      },
      {
        element: '#sign-button',
        intro: 'Review the prescription and click on \'Sign and Submit\' to send the prescription to the healthworker.'
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
