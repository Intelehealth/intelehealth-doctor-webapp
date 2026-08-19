import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { EncounterModel } from 'src/app/model/model';
import { DiagnosisService } from 'src/app/services/diagnosis.service';

@Component({
  selector: 'app-referral-consent',
  standalone: true,
  templateUrl: './referral-consent.component.html',
  imports: [CommonModule, ReactiveFormsModule, MatExpansionModule, MatIconModule, MatButtonModule, TranslateModule]
})
export class ReferralConsentComponent {
  @Input() referralConsentForm: FormGroup;
  @Input() isVisitNoteProvider = false;
  @Input() visitEnded: EncounterModel | string;
  @Input() isMCCUser = false;

  constructor(private diagnosisService: DiagnosisService) { }

  /**
  * Delete the referral decision observation for this visit
  * @returns {void}
  */
  deleteReferralConsent(): void {
    if (!this.referralConsentForm.value.uuid) {
      this.referralConsentForm.reset();
      return;
    }
    this.diagnosisService.deleteObs(this.referralConsentForm.value.uuid).subscribe(() => {
      this.referralConsentForm.reset();
    });
  }
}
