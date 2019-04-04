import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-active-visit',
  templateUrl: './active-visit.component.html',
  styleUrls: ['./active-visit.component.css']
})
export class ActiveVisitComponent implements OnInit {
  dataSource: any = [];
  p = 1;
  constructor(private service: VisitService,
    public snackbar: MatSnackBar) { }

  ngOnInit() {
    this.service.getVisits()
    .subscribe(response => {
      this.dataSource = response.results;
    }, err => {
      if (err.error instanceof Error) {
        this.snackbar.open('Client-side error', null, {duration: 4000});
      } else {
        this.snackbar.open('Server-side error', null, {duration: 4000});
      }
    });
  }

}
