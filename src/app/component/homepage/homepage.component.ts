import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
activePatient: number;
  constructor(private service: VisitService,
              private snackbar: MatSnackBar) { }

  ngOnInit() {
    this.service.getVisits()
    .subscribe(response => {
      const results = response.results;
      let length = 0;
      results.forEach(active => {
        if (active.encounters.length > 0) {
          // tslint:disable-next-line:max-line-length
          const value = active.encounters[0].display;
          if (value.match('Vitals') || value.match('ADULTINITIAL') || value.match('Flagged')) {
            length += 1;
          }
        }
      });
      this.activePatient = length;
    }, err => {
      if (err.error instanceof Error) {
        this.snackbar.open('Client-side error', null, {duration: 4000});
      } else {
        this.snackbar.open('Server-side error', null, {duration: 4000});
      }
    });
  }

}
