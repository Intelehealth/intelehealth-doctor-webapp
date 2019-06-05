import { VisitService } from './../../services/visit.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { Router } from '@angular/router';


@Component({
  selector: 'app-find-patient',
  templateUrl: './find-patient.component.html',
  styleUrls: ['./find-patient.component.css']
})

export class FindPatientComponent implements OnInit {
  values: any = [];

  constructor(public dialog: MatDialogRef<FindPatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: VisitService,
    private router: Router) { }

  ngOnInit() {
    this.values = this.data.value;
  }

  find(uuid) {
    this.service.recentVisits(uuid)
      .subscribe(response => {
        this.router.navigate(['/patientSummary', response.results[0].patient.uuid, response.results[0].uuid]);
        this.dialog.close();
      });
  }

}
