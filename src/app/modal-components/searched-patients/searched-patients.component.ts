import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-searched-patients',
  templateUrl: './searched-patients.component.html',
  styleUrls: ['./searched-patients.component.scss']
})
export class SearchedPatientsComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<SearchedPatientsComponent>,
    private router: Router,
    private visitService: VisitService
  ) { }

  ngOnInit(): void {
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

  view(uuid: string) {
    this.visitService.recentVisits(uuid).subscribe((response: any) => {
      this.router.navigate(['/dashboard/visit-summary', response.results[0].uuid]);
      this.close(true);
    });
  }
}
