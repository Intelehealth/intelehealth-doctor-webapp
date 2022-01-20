import { VisitService } from './../../services/visit.service';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-find-patient',
  templateUrl: './find-patient.component.html',
  styleUrls: ['./find-patient.component.css']
})

export class FindPatientComponent implements OnInit {
  values: any;
  msg = this.translate.instant('Sorry no Patient Found..');

  constructor(public dialog: MatDialogRef<FindPatientComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private service: VisitService,
    private router: Router,
    private translate: TranslateService) { }

  ngOnInit() {
    if (typeof this.data.value === 'string') {
      this.values = [];
      this.msg = this.translate.instant(this.data.value);
    } else {
      this.values = this.data.value;
    }
    this.translate.setDefaultLang(localStorage.getItem('selectedLanguage'));
  }

  find(uuid) {
    this.service.recentVisits(uuid)
      .subscribe(response => {
        this.router.navigate(['/visitSummary', response.results[0].patient.uuid, response.results[0].uuid]);
        this.dialog.close();
      });
  }

}
