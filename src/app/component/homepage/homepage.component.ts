import { Component, OnInit, ViewChild } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { UserIdleService } from 'angular-user-idle';
import { AuthService } from 'src/app/services/auth.service';

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
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})

export class HomepageComponent implements OnInit {
  displayColumns: string[] = ['id', 'name', 'gender', 'dob', 'location', 'status', 'lastSeen'];
  dataSource = new MatTableDataSource<VisitData>();
  dataSourceFlag = new MatTableDataSource<VisitData>();

  value: any = {};
  activePatient: number;
  flagPatientNo: number;
  visitNoteNo: number;
  flagPatient: VisitData[] = [];
  results: VisitData[] = [];
  visitLength = 0;
  flagLength = 0;

  constructor(private service: VisitService,
              private snackbar: MatSnackBar,
              private userIdle: UserIdleService,
              private authService: AuthService) { }

  @ViewChild('page1') page1: MatPaginator;
  @ViewChild('page2') page2: MatPaginator;
  @ViewChild('sortCol1') sortCol1: MatSort;
  @ViewChild('sortCol2') sortCol2: MatSort;

  ngOnInit() {
    this.userIdle.startWatching();

    // Start watching when user idle is starting.
    this.userIdle.onTimerStart().subscribe(count => {
      if (count === 1) {
        this.authService.logout();
        this.userIdle.stopWatching();
      }
      });

    this.service.getVisits()
      .subscribe(response => {
        const visits = response.results;
        let length = 0;
        let flagLength = 0;
        let visitNoteLength = 0;
        visits.forEach(active => {
          if (active.encounters.length > 0) {
            const value = active.encounters[0].display;
            if (value.match('ADULTINITIAL')) {
              length += 1;
            }
            if (!value.match('Flagged') && !value.match('Visit Complete') && !value.match('Patient Exit Survey')) {
              this.value.visitId = active.uuid;
              this.value.patientId = active.patient.uuid;
              this.value.id = active.patient.identifiers[0].identifier;
              this.value.name = active.patient.person.display;
              this.value.gender = active.patient.person.gender;
              this.value.dob = active.patient.person.birthdate;
              this.value.location = active.location.display;
              this.value.status = active.encounters[0].encounterType.display;
              this.value.lastSeen = active.encounters[0].encounterDatetime;
              this.results.push(this.value);
              this.value = {};
            }
            if (value.match('Flagged')) {
              if (!active.encounters[0].voided) {
                this.value.visitId = active.uuid;
                this.value.patientId = active.patient.uuid;
                this.value.id = active.patient.identifiers[0].identifier;
                this.value.name = active.patient.person.display;
                this.value.gender = active.patient.person.gender;
                this.value.dob = active.patient.person.birthdate;
                this.value.location = active.location.display;
                this.value.status = active.encounters[0].encounterType.display;
                this.value.lastSeen = active.encounters[0].encounterDatetime;
                this.flagPatient.push(this.value);
                this.value = {};
                flagLength += 1;
              }
            }
            if (value.match('Visit Note')) {
              visitNoteLength += 1;
            }
          }
        });
        this.dataSourceFlag = new MatTableDataSource<VisitData>(this.flagPatient);
        setTimeout(() => {
          this.dataSourceFlag.paginator = this.page1;
          this.dataSourceFlag.sort = this.sortCol1;
        }, 1000);
        this.dataSource = new MatTableDataSource<VisitData>(this.results);
        setTimeout(() => {
          this.dataSource.paginator = this.page2;
          this.dataSource.sort = this.sortCol2;
        }, 1000);
        this.visitLength = this.results.length;
        this.flagLength = this.flagPatient.length;
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

  applyFilterVisit(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyFilterFlag(filterValue: string) {
    this.dataSourceFlag.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceFlag.paginator) {
      this.dataSourceFlag.paginator.firstPage();
    }
  }
}
