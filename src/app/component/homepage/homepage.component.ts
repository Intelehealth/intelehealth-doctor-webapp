
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from './../../services/session.service';
import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material/snack-bar';
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
  gender: string;
  dob: string;
  location: string;
  status: string;
  lastSeen: string;
  visitId: string;
  patientId: string;
  provider: string;
}


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent implements OnInit {
  value: any = {};
  activePatient: number;
  flagPatientNo: number;
  visitNoteNo: number;
  completeVisitNo: number;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  review: VisitData[] = [];

  constructor(private sessionService: SessionService,
              private authService: AuthService,
              private service: VisitService,
              private snackbar: MatSnackBar) { }

  ngOnInit() {
    if (getFromStorage('visitNoteProvider')) {deleteFromStorage('visitNoteProvider'); }
    const userDetails = getFromStorage('user');
    if (userDetails) {
      this.sessionService.provider(userDetails.uuid)
      .subscribe(provider => {
        saveToStorage('provider', provider.results[0]);
        // const attributes = provider.results[0].attributes;
        // attributes.forEach(element => {
        //   if (element.attributeType.uuid === 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !element.voided) {
        //     this.specialization = element.value;
        //   }
        // });
      });
    } else {this.authService.logout(); }
    this.service.getVisits()
      .subscribe( response => {
        const visits = response.results;
        let length = 0, flagLength = 0, visitNoteLength = 0, completeVisitLength = 0;
        visits.forEach(async active => {
          if (active.encounters.length > 0) {
            const value = active.encounters[0].display;
            if (value.match('Flagged')) {
              if (!active.encounters[0].voided) {
                const values = this.assignValueToProperty(active, false);
                this.flagVisit.push(values);
                flagLength += 1;
              }
            } else if (value.match('ADULTINITIAL') || value.match('Vitals')) {
              const values = this.assignValueToProperty(active, false);
              this.waitingVisit.push(values);
              length += 1;
            } else if (value.match('Review 1') || value.match('Review 2')) {
              const values = this.assignValueToProperty(active, false);
              this.progressVisit.push(values);
              visitNoteLength += 1;
            } else if (value.match('Visit Note')) {
              const sameProvider: any = this.processReview('visitnote', active.encounters);
              const values = this.assignValueToProperty(active, sameProvider);
              if (sameProvider) {
                this.progressVisit.push(values);
                visitNoteLength += 1;
              } else {
                this.review.push(values);
                this.waitingVisit.push(values);
                length += 1;
              }
            } else if (value.match('Visit Complete')) {
              const sameProvider: any = this.processReview('complete', active.encountersve);
              const values = this.assignValueToProperty(active, sameProvider);
              if (sameProvider) {
                this.completedVisit.push(values);
                completeVisitLength += 1;
              } else {
                this.review.push(values);
                this.waitingVisit.push(values);
                length += 1;
              }
            }
          }
          this.value = {};
        });
        saveToStorage('allAwaitingConsult', this.waitingVisit);
        saveToStorage('allReviewVisit', this.review);
        console.log('review', this.review);
        this.setSpiner = false;
        this.activePatient = length;
        this.flagPatientNo = flagLength;
        this.visitNoteNo = visitNoteLength;
        this.completeVisitNo = completeVisitLength;
      }, err => {
        if (err.error instanceof Error) {
          this.snackbar.open('Client-side error', null, { duration: 4000 });
        } else {
          this.snackbar.open('Server-side error', null, { duration: 4000 });
        }
      });
  }

  assignValueToProperty(active, sameProvider) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.dob = active.patient.person.birthdate;
    this.value.location = active.location.display;
    this.value.status = sameProvider ? active.encounters[0].encounterType.display : 'ADULTINITIAL';
    // tslint:disable-next-line: max-line-length
    this.value.provider = sameProvider ? active.encounters[0].encounterProviders[0].provider.display.split('- ')[1] :
           active.encounters[active.encounters.length - 1].encounterProviders[0].provider.display.split('- ')[1];
    this.value.lastSeen = sameProvider ? active.encounters[0].encounterDatetime :
           active.encounters[active.encounters.length - 1].encounterDatetime;
    return this.value;
  }

  processReview(type, encounter) {
    const provider: any = getFromStorage('provider');
    if (type === 'visitnote') {
      if (encounter[0].encounterProviders.some(pro => pro.provider.uuid === provider.uuid)) {
        console.log('if', encounter[0].encounterProviders[0].provider.uuid, provider.uuid);
        return true;
      } else {
        console.log('else', encounter[0].encounterProviders[0].provider.uuid, provider.uuid);
        return false;
      }
    } else if (type === 'complete') {
      return true;
    }
  }

}
