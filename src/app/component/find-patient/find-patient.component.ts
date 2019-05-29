import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

// export interface DialogData {
//   animal: string;
//   name: string;
// }


@Component({
  selector: 'app-find-patient',
  templateUrl: './find-patient.component.html',
  styleUrls: ['./find-patient.component.css']
})

export class FindPatientComponent implements OnInit {
values: any = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit() {
    this.values = this.data.value;
  }

}
