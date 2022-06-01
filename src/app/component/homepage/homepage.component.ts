
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

interface ReferralHomepage {
  awaitingCall: Array<{}>;
  awaitingHospital: Array<{}>;
  totalVisistInHospial: number;
}

interface ReferralVisit {
  visitId: string;
  patientId: string;
  urgent: Boolean;
  id: string;
  name: string;
  gender: string;
  dueDate: Date;
  status: string;
  lastCalled: Date;
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent implements OnInit {
  value: any = {};
  referralVisit: ReferralHomepage = { awaitingCall : [], awaitingHospital: [], totalVisistInHospial: 0};
  referralCallValues: ReferralVisit[] = [];
  referralHospitalValues: ReferralVisit[] = [];
  activePatient: number;
  flagPatientNo: number;
  visitNoteNo: number;
  completeVisitNo: number;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  review1: VisitData[] = [];
  review2: VisitData[] = [];
  coordinator: Boolean = getFromStorage('coordinator') || false;

  constructor(private sessionService: SessionService,
    private authService: AuthService,
    private visitService: VisitService,
    private snackbar: MatSnackBar) { }

  ngOnInit() {
    if (getFromStorage('visitNoteProvider')) { deleteFromStorage('visitNoteProvider'); }
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
    } else { this.authService.logout(); }
    if (this.coordinator) {
      this.getReferralVisits();
    } else {
      this.getVisits();
    }
  }

  onChange(event) {
    if (event) {
      this.coordinator = true;
      this.getReferralVisits();
    } else {
      this.coordinator = false;
      this.getVisits();
    }
    saveToStorage('coordinator', event);
  }

  getVisits() {
    this.visitService.getVisits()
      .subscribe(response => {
        const visits = response.results;
        let length = 0, flagLength = 0, visitNoteLength = 0, completeVisitLength = 0;
        visits.forEach(async active => {
          if (active.encounters.length > 0) {
            const value = active.encounters[0].display;
            if (value.match('Flagged')) {
              if (!active.encounters[0].voided) {
                const values = this.assignValueToProperty(active, 'Flagged');
                this.flagVisit.push(values);
                flagLength += 1;
              }
            } else if (value.match('ADULTINITIAL') || value.match('Vitals')) {
              const values = this.assignValueToProperty(active, 'ADULTINITIAL');
              this.waitingVisit.push(values);
              length += 1;
            } else if (value.match('Review 2')) {
              const sameProvider: any = this.processReview(active.encounters[0]);
              const values = this.assignValueToProperty(active, sameProvider ? 'Visit Note' : 'ADULTINITIAL', sameProvider);
              if (sameProvider) {
                this.review2.push({ ...values, seen: true });
                this.completedVisit.push(values);
                completeVisitLength += 1;
              } else {
                const review1: any = this.processReview(active.encounters[1]);
                const newValues = this.assignValueToProperty(active, review1 ? 'Visit Note' : 'ADULTINITIAL', review1);
                if (review1) {
                  this.review1.push({ ...newValues, seen: true });
                  this.progressVisit.push(newValues);
                  visitNoteLength += 1;
                } else {
                  const visitComplete = active.encounters.filter(enc => enc.display.match('Visit Complete'));
                  const visitNote = active.encounters.filter(enc => enc.display.match('Visit Note'));
                  if (visitComplete.length) {
                    if (visitNote.length) {
                      const mainDoctor: any = this.processReview(visitNote[0]);
                      if (mainDoctor) {
                        const visitCompleteValues = this.assignValueToProperty(active, 'Visit Complete', mainDoctor);
                        this.completedVisit.push(visitCompleteValues);
                        completeVisitLength += 1;
                      }
                    } else {
                      const waitingListValues = this.assignValueToProperty(active, 'ADULTINITIAL');
                      this.waitingVisit.push(waitingListValues);
                      length += 1;
                    }
                  } else if (visitNote.length) {
                    const mainDoctor: any = this.processReview(visitNote[0]);
                    if (mainDoctor) {
                      const visitNoteValues = this.assignValueToProperty(active, 'Visit Note', mainDoctor);
                      this.progressVisit.push(visitNoteValues);
                      visitNoteLength += 1;
                    } else {
                      const waitingListValues = this.assignValueToProperty(active, 'ADULTINITIAL');
                      this.waitingVisit.push(waitingListValues);
                      length += 1;
                    }
                  } else {
                    const waitingListValues = this.assignValueToProperty(active, 'ADULTINITIAL');
                    this.waitingVisit.push(waitingListValues);
                    length += 1;
                  }
                }
              }
            } else if (value.match('Review 1')) {
              const sameProvider: any = this.processReview(active.encounters[0]);
              if (sameProvider) {
                const review1Values = this.assignValueToProperty(active, 'Visit Note', sameProvider);
                this.review1.push({ ...review1Values, seen: true });
                this.completedVisit.push(review1Values);
                completeVisitLength += 1;
              } else {
                const visitComplete = active.encounters.filter(enc => enc.display.match('Visit Complete'));
                const visitNote = active.encounters.filter(enc => enc.display.match('Visit Note'));
                if (visitComplete.length) {
                  if (visitNote.length) {
                    const mainDoctor: any = this.processReview(visitNote[0]);
                    if (mainDoctor) {
                      const visitCompleteValues = this.assignValueToProperty(active, 'Visit Complete', mainDoctor);
                      this.completedVisit.push(visitCompleteValues);
                      completeVisitLength += 1;
                    }
                  } else {
                    const waitingListValues = this.assignValueToProperty(active, 'ADULTINITIAL');
                    this.waitingVisit.push(waitingListValues);
                    length += 1;
                  }
                } else if (visitNote.length) {
                  const mainDoctor: any = this.processReview(visitNote[0]);
                  if (mainDoctor) {
                    const visitNoteValues = this.assignValueToProperty(active, 'Visit Note', mainDoctor);
                    this.progressVisit.push(visitNoteValues);
                    visitNoteLength += 1;
                  } else {
                    const waitingListValues = this.assignValueToProperty(active, 'ADULTINITIAL');
                    this.waitingVisit.push(waitingListValues);
                    length += 1;
                  }
                } else {
                  const waitingListValues = this.assignValueToProperty(active, 'ADULTINITIAL');
                  this.waitingVisit.push(waitingListValues);
                  length += 1;
                }
              }
            } else if (value.match('Visit Note')) {
              const sameProvider: any = this.processReview(active.encounters[0]);
              const values = this.assignValueToProperty(active, sameProvider ? 'Visit Note' : 'ADULTINITIAL', sameProvider);
              if (sameProvider) {
                this.progressVisit.push(values);
                visitNoteLength += 1;
              } else {
                this.review1.push(values);
                this.waitingVisit.push(values);
                length += 1;
              }
            } else if (value.match('Visit Complete')) {
              const sameProvider: any = this.processReview(active.encounters[1]);
              const values = this.assignValueToProperty(active, sameProvider ? 'Visit Complete' : 'ADULTINITIAL', sameProvider);
              if (sameProvider) {
                this.completedVisit.push(values);
                completeVisitLength += 1;
              } else {
                this.review1.push(values);
                this.waitingVisit.push(values);
                length += 1;
              }
            }
          }
          this.value = {};
        });
        // saveToStorage('allAwaitingConsult', this.waitingVisit);
        saveToStorage('allReviewVisit1', this.review1);
        saveToStorage('allReviewVisit2', this.review2);
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

  assignValueToProperty(active, status, sameProvider = false) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.dob = active.patient.person.birthdate;
    this.value.location = active.location.display;
    this.value.status = status;
    // tslint:disable-next-line: max-line-length
    this.value.provider = sameProvider ? active.encounters[0].encounterProviders[0].provider.display.split('- ')[1] :
      active.encounters[active.encounters.length - 1].encounterProviders[0].provider.display.split('- ')[1];
    this.value.lastSeen = sameProvider ? active.encounters[0].encounterDatetime :
      active.encounters[active.encounters.length - 1].encounterDatetime;
    return this.value;
  }

  processReview(encounter) {
    const provider: any = getFromStorage('provider');
    if (encounter.encounterProviders.some(pro => pro.provider.uuid === provider.uuid)) {
      return true;
    } else {
      return false;
    }
  }

  getReferralVisits() {
    this.visitService.getReferralVisits()
      .subscribe(async visits => {
        if (visits) {
          visits.results.forEach(visit => {
            if (visit.encounters.length > 1) {
              const visitNote = visit.encounters.filter(enc => enc.display.match('Visit Note'));
              if (visitNote.length) {
                visitNote.forEach((encounter, index) => {
                  const referral = encounter.obs.filter(ob => ob.display.match('Referral'));
                  if (referral.length) {
                    const data = visit;
                    data.referralDate = referral[0].obsDatetime;
                    const coOrdinatorStatus = visitNote[index].obs.filter(ob => ob.display.match('co-ordinator status'));
                    if (visitNote[index].obs.some(ob => ob.display.match('Urgent Referral'))) {
                      data.urgent = true;
                    }
                    if (coOrdinatorStatus.length) {
                      // tslint:disable-next-line: max-line-length
                      const latestUpdate = coOrdinatorStatus.sort((a: any, b: any) => new Date(b.obsDatetime).getTime() - new Date(a.obsDatetime).getTime());
                      data.status = JSON.parse(latestUpdate[0].value).status;
                      if (data.status === 'Will come to hospital') {
                        data.referralDate = coOrdinatorStatus[0].obsDatetime;
                        data.lastCalled = coOrdinatorStatus[0].obsDatetime;
                        this.referralVisit.awaitingHospital.push(data);
                      } else if (data.status === 'Patient need a callback') {
                        try {
                          data.dueDate = JSON.parse(coOrdinatorStatus[0].value).date;
                        } catch (e) {}
                        data.referralDate = coOrdinatorStatus[0].obsDatetime;
                        data.lastCalled = coOrdinatorStatus[0].obsDatetime;
                        this.referralVisit.awaitingCall.push(data);
                      } else if (data.status === 'Patient came to Aravind') {
                        this.referralVisit.totalVisistInHospial += 1;
                      }
                    } else {
                      this.referralVisit.awaitingCall.push(data);
                    }
                  }
                });
              }
            }
          });
          await this.assignValueToReferralProperty(this.referralVisit.awaitingCall, 'referralCallValues');
          await this.assignValueToReferralProperty(this.referralVisit.awaitingHospital, 'referralHospitalValues');
          this.setSpiner = false;
        }
      });
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  assignValueToReferralProperty(visits, variable) {
    const data = [];
    return new Promise((resolve, reject) => {
      if (visits.length) {
        visits.forEach((visit, index) => {
          data.push({
            visitId: visit.uuid,
            patientId: visit.patient.uuid,
            urgent: visit.urgent || false,
            id: visit.patient.identifiers[0].identifier,
            name: visit.patient.person.display,
            gender: visit.patient.person.gender,
            dueDate: visit.dueDate ? visit.dueDate : this.addDays(visit.referralDate, variable === 'referralHospitalValues' ? 14 : 3),
            status: visit.status || 'Need Callback',
            lastCalled: visit.lastCalled
          });
          if (visits.length === index + 1) {
            this[variable] = data;
            resolve(data);
          }
        });
      } else {
        resolve(data);
      }
    });
  }

  setType(type) {
    if (type === 'complete') {
      saveToStorage('allAwaitingConsult', this.completedVisit);
    } else if (type === 'progress') {
      saveToStorage('allAwaitingConsult', this.progressVisit);
    } else if (type === 'waiting') {
      saveToStorage('allAwaitingConsult', this.waitingVisit);
    } else {
      saveToStorage('allAwaitingConsult', this.flagVisit);
    }
  }

}
