import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
activePatient: number;
flagPatientNo: number;
flagPatient: any = [];
results: any = [];
p = 1; q = 1;
values: any = [];
show = true;

searchForm = new FormGroup({
  input: new FormControl('')
});

  constructor(private service: VisitService,
              private snackbar: MatSnackBar,
              private http: HttpClient) { }

  ngOnInit() {
    this.service.getVisits()
    .subscribe(response => {
      const visits = response.results;
      let length = 0;
      let flagLength = 0;
      visits.forEach(active => {
        if (active.encounters.length > 0) {
          const value = active.encounters[0].display;
          if (value.match('Vitals') || value.match('ADULTINITIAL') || value.match('Flagged')) {
            length += 1;
          }
          if (!value.match('Flagged')) {
            this.results.push(active);
          }
          if (value.match('Flagged')) {
            this.flagPatient.push(active);
            flagLength += 1;
          }
        }
      });
      this.activePatient = length;
      this.flagPatientNo = flagLength;
    }, err => {
      if (err.error instanceof Error) {
        this.snackbar.open('Client-side error', null, {duration: 4000});
      } else {
        this.snackbar.open('Server-side error', null, {duration: 4000});
      }
    });
  }

search() {
  this.show = false;
  const find = this.searchForm.value;
  // tslint:disable-next-line:max-line-length
  const url = `http://demo.intelehealth.io/openmrs/ws/rest/v1/patient?q=${find.input}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
  this.http.get(url)
  .subscribe(response => {
    this.values = response['results'];
  }, err => {
    if (err.error instanceof Error) {
      this.snackbar.open('Client-side error', null, {duration: 2000});
    } else {
      this.snackbar.open('Server-side error', null, {duration: 2000});
    }
  });
  }

}
