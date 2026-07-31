import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { RecentVisitsApiResponseModel } from 'src/app/model/model';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-searched-patients',
  templateUrl: './searched-patients.component.html',
  styleUrls: ['./searched-patients.component.scss']
})
export class SearchedPatientsComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<SearchedPatientsComponent>,
    private router: Router,
    private visitService: VisitService,
    private toastr: ToastrService,
    private translateService: TranslateService,
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
  * Clean a patient's display name by dropping a trailing "." placeholder family
  * name (used when a patient was registered without a surname).
  * @param {string} display - person.display from OpenMRS
  * @return {string}
  */
  cleanName(display: string): string {
    return (display || '').replace(/\s*\.\s*$/, '').trim();
  }

  /**
  * View visit details
  * @param {string} uuid - visit uuid
  * @return {void}
  */
  view(uuid: string) {
    this.visitService.recentVisits(uuid).subscribe((response: RecentVisitsApiResponseModel) => {
      if(response.results?.length > 0){
        this.router.navigate(['/dashboard/visit-summary', response.results[0].uuid]);
        this.close(true);
      } else {
        this.toastr.error(this.translateService.instant('Visit Not Found for this patient'), this.translateService.instant('Visit Not Found!'));
      }
    });
  }
}
