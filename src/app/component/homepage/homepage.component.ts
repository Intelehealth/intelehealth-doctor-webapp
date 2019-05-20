import { Component, OnInit, ViewChild,} from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar, MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

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
  displayedColumns: string[] = ['id', 'name', 'gender', 'dob', 'location', 'status', 'lastSeen'];
  dataSource = new MatTableDataSource<VisitData>();

value: any = {};
activePatient: number;
flagPatientNo: number;
visitNoteNo: number;
flagPatient: any = [];
results: VisitData[] = [];
p = 1; q = 1;
show = true;
resultsLength = 0;

  constructor(private service: VisitService,
              private snackbar: MatSnackBar) { }

@ViewChild(MatPaginator) paginator: MatPaginator;
@ViewChild(MatSort) sort: MatSort;

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
          if (value.match('Vitals') || value.match('ADULTINITIAL') || value.match('Flagged')) {
            length += 1;
          }
          if (!value.match('Flagged') && !value.match('Visit Complete')) {
            // console.log(active);
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
            this.flagPatient.push(active);
            flagLength += 1;
          }
          if (value.match('Visit Note')) {
            visitNoteLength += 1;
          }
        }
      });
      this.dataSource = new MatTableDataSource<VisitData>(this.results);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, 1000);
      this.resultsLength = this.results.length;
      this.activePatient = length;
      this.flagPatientNo = flagLength;
      this.visitNoteNo = visitNoteLength;
    }, err => {
      if (err.error instanceof Error) {
        this.snackbar.open('Client-side error', null, {duration: 4000});
      } else {
        this.snackbar.open('Server-side error', null, {duration: 4000});
      }
    });
  }

applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
