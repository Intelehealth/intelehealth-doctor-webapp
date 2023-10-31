import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RecentVisitsApiResponseModel } from 'src/app/model/model';
import { RecentVisitsApiResponseModel } from 'src/app/model/model';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-searched-patients',
  templateUrl: './searched-patients.component.html',
  styleUrls: ['./searched-patients.component.scss']
})
export class SearchedPatientsComponent {
export class SearchedPatientsComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<SearchedPatientsComponent>,
    private router: Router,
    private visitService: VisitService
  ) { }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

  /**
  * View visit details
  * @param {string} uuid - visit uuid
  * @return {void}
  */
  view(uuid: string) {
    this.visitService.recentVisits(uuid).subscribe((response: RecentVisitsApiResponseModel) => {
    this.visitService.recentVisits(uuid).subscribe((response: RecentVisitsApiResponseModel) => {
      this.router.navigate(['/dashboard/visit-summary', response.results[0].uuid]);
      this.close(true);
    });
  }
}
