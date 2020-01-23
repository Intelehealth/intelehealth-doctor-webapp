import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material';

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

  constructor(private service: VisitService,
              private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.service.getVisits()
      .subscribe(response => {
        const visits = response.results;
        let length = 0, flagLength = 0, visitNoteLength = 0, completeVisitLength = 0;
        visits.forEach(active => {
          if (active.encounters.length > 0) {
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
