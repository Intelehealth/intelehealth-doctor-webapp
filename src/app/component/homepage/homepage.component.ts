import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from './../../services/session.service';
import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material';
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
  specialization;

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
        const attributes = provider.results[0].attributes;
        attributes.forEach(element => {
          if (element.attributeType.uuid === 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !element.voided) {
            this.specialization = element.value;
          }
        });
      });
    } else {this.authService.logout(); }
    this.service.getVisits()
      .subscribe(response => {
        const visits = response.results;
        let length = 0, flagLength = 0, visitNoteLength = 0, completeVisitLength = 0;
        visits.forEach(active => {
          if (active.encounters.length > 0) {
            if (active.attributes.length) {
              const attributes = active.attributes;
              const speRequired = attributes.filter(attr => attr.attributeType.uuid === '3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d');
              if (speRequired.length) {
                speRequired.forEach(spe => {
                  if (!spe.voided && spe.value === this.specialization) {
                    const value = active.encounters[0].display;
                    if (value.match('Flagged')) {
                      if (!active.encounters[0].voided) {
                        const values = this.assignValueToProperty(active);
                        this.flagVisit.push(values);
                        flagLength += 1;
                      }
                    } else if (value.match('ADULTINITIAL') || value.match('Vitals')) {
                      const values = this.assignValueToProperty(active);
                      this.waitingVisit.push(values);
                      length += 1;
                    } else if (value.match('Visit Note')) {
                      const values = this.assignValueToProperty(active);
                      this.progressVisit.push(values);
                      visitNoteLength += 1;
                    } else if (value.match('Visit Complete')) {
                      const values = this.assignValueToProperty(active);
                      this.completedVisit.push(values);
                      completeVisitLength += 1;
                    }
                  }
                });
              }
            } else if (this.specialization === 'General Physician') {
              const value = active.encounters[0].display;
              if (value.match('Flagged')) {
                if (!active.encounters[0].voided) {
                  const values = this.assignValueToProperty(active);
                  this.flagVisit.push(values);
                  flagLength += 1;
                }
              } else if (value.match('ADULTINITIAL') || value.match('Vitals')) {
                const values = this.assignValueToProperty(active);
                this.waitingVisit.push(values);
                length += 1;
              } else if (value.match('Visit Note')) {
                const values = this.assignValueToProperty(active);
                this.progressVisit.push(values);
                visitNoteLength += 1;
              } else if (value.match('Visit Complete')) {
                const values = this.assignValueToProperty(active);
                this.completedVisit.push(values);
                completeVisitLength += 1;
              }
            }
          }
          this.value = {};
        });
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

  assignValueToProperty(active) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.dob = active.patient.person.birthdate;
    this.value.location = active.location.display;
    this.value.status = active.encounters[0].encounterType.display;
    this.value.provider = active.encounters[0].encounterProviders[0].provider.display.split('- ')[1];
    this.value.lastSeen = active.encounters[0].encounterDatetime;
    return this.value;
  }

}
