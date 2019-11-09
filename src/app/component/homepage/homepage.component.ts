import { Component, OnInit, ViewChild } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

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
  displayColumns: string[] = ['id', 'name', 'gender', 'dob', 'location', 'status', 'provider', 'lastSeen'];
  dataSourceFlag;
  dataSourceWaiting;
  dataSourceProgress;
  dataSourceComplete;
  value: any = {};
  activePatient: number;
  flagPatientNo: number;
  visitNoteNo: number;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  visitLength = 0;
  flagLength = 0;
  setSpiner = true;

  constructor(private service: VisitService,
              private snackbar: MatSnackBar) { }

  @ViewChild('page1') page1: MatPaginator;
  @ViewChild('page2') page2: MatPaginator;
  @ViewChild('page3') page3: MatPaginator;
  @ViewChild('page4') page4: MatPaginator;
  @ViewChild('sortCol1') sortCol1: MatSort;
  @ViewChild('sortCol2') sortCol2: MatSort;
  @ViewChild('sortCol3') sortCol3: MatSort;
  @ViewChild('sortCol4') sortCol4: MatSort;

  ngOnInit() {
    this.service.getVisits()
      .subscribe(response => {
        const visits = response.results;
        let length = 0;
        let flagLength = 0;
        let visitNoteLength = 0;
        visits.forEach(active => {
          if (active.encounters.length > 0) {
            const value = active.encounters[0].display;
            if (value.match('Flagged')) {
              if (!active.encounters[0].voided) {
                const values = this.assignValueToProperty(active);
                console.log(values)
                this.flagVisit.push(values);
                flagLength += 1;
              }
            } else if (value.match('ADULTINITIAL')) {
              const values = this.assignValueToProperty(active);
              this.waitingVisit.push(values);
              length += 1;
            } else if (value.match('Visit Note')) {
              const values = this.assignValueToProperty(active);
              this.progressVisit.push(values);
            } else if (value.match('Visit Complete')) {
              const values = this.assignValueToProperty(active);
              this.completedVisit.push(values);
              visitNoteLength += 1;
            }
          }
          this.value = {};
        });
        this.dataSourceFlag = new MatTableDataSource<VisitData>(this.flagVisit);
        this.dataSourceWaiting = new MatTableDataSource<VisitData>(this.waitingVisit);
        this.dataSourceProgress = new MatTableDataSource<VisitData>(this.progressVisit);
        this.dataSourceComplete = new MatTableDataSource<VisitData>(this.completedVisit);
        setTimeout(() => {
          this.dataSourceFlag.paginator = this.page1;
          this.dataSourceWaiting.paginator = this.page2;
          this.dataSourceProgress.paginator = this.page3;
          this.dataSourceComplete.paginator = this.page4;
          this.dataSourceFlag.sort = this.sortCol1;
          this.dataSourceWaiting.sort = this.sortCol2;
          this.dataSourceProgress.sort = this.sortCol3;
          this.dataSourceComplete.sort = this.sortCol4;
          this.setSpiner = false;
        }, 1000);
        this.visitLength = this.waitingVisit.length;
        this.flagLength = this.flagVisit.length;
        this.activePatient = length;
        this.flagPatientNo = flagLength;
        this.visitNoteNo = visitNoteLength;
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

  applyFilterFlagVisit(filterValue: string) {
    this.dataSourceFlag.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceFlag.paginator) {
      this.dataSourceFlag.paginator.firstPage();
    }
  }

  applyFilterWaitingVisit(filterValue: string) {
    this.dataSourceWaiting.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceWaiting.paginator) {
      this.dataSourceWaiting.paginator.firstPage();
    }
  }

  applyFilterProgressVisit(filterValue: string) {
    this.dataSourceProgress.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceProgress.paginator) {
      this.dataSourceProgress.paginator.firstPage();
    }
  }

  applyFilterCompleteVisit(filterValue: string) {
    this.dataSourceComplete.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceComplete.paginator) {
      this.dataSourceComplete.paginator.firstPage();
    }
  }
}
