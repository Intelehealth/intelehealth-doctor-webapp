import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReferralModel } from 'src/app/model/model';

@Component({
  selector: 'app-share-prescription',
  templateUrl: './share-prescription.component.html',
  styleUrls: ['./share-prescription.component.scss'],
})
export class SharePrescriptionComponent {
  isRapidCompletion: boolean = false;
  namcoReferral: ReferralModel = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<SharePrescriptionComponent>) {
    // Check if this is a rapid completion warning
    if (data && data.isRapidCompletion) {
      this.isRapidCompletion = true;
    }
    if (data && data.namcoReferral) {
      this.namcoReferral = data.namcoReferral;
    }
  }

  /**
  * The NAMCO referral's speciality, without its "Namco" prefix (e.g. "Namco _ Dermatology"
  * becomes "Dermatology") — the prefix is only needed internally to identify NAMCO referrals,
  * not something a doctor needs to see repeated back to them.
  * @return {string}
  */
  get namcoReferralSpecialty(): string {
    return (this.namcoReferral?.speciality || '').replace(/^namco[\s_]*/i, '').trim();
  }

  /**
  * Close modal
  * @param {boolean} val - Dialog result
  * @return {void}
  */
  close(val: boolean) {
    this.dialogRef.close(val);
  }

}
