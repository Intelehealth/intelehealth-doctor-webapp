import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AiTxService } from '../../services/aitx.service';

@Component({
  selector: 'lib-aillmtx-referral',
  templateUrl: './aillmtx-referral.component.html',
  styleUrls: ['./aillmtx-referral.component.scss']
})
export class AillmtxReferralComponent {
  @Input() patientInfo: any;
  @Input() visit: any;
  @Input() existingReferral: any[] = [];
  @Output() referralSelected = new EventEmitter<string[]>();
  @Input() diagnosisName: string;
  @Input() notesss: string;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  referralList: any = []
  furtherQuestionsList: any = []
  selectedReferral: any[] = [];

  constructor(
    private TxService: AiTxService,
  ) { }

  ngOnInit() {}

  public getAIReferral(diagnosis?: string) {
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);
    this.isLoading = true;
    this.referralList = [];
    this.furtherQuestionsList = [];
    this.TxService.getAITTx(payload, diagnosis).subscribe({
      next: (data: any) => {
        if (data?.result?.referral?.length > 0) {
          this.noData = false;
          this.referralList = data.result.referral.map((v: any) => ({
            referral_facility: v.referral_facility,
            referral_required: v.referral_required,
            referral_to: v.referral_to,
            remark: v.remark
          }));
        } else {
          this.noData = true;
        }
      },
      error: (err: any) => {
        console.error('Error in getAIReferral:', err);
        this.hasError = true;
        this.isLoading = false;
        this.noData = true;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  public getAIReferralWithRetry(diagnosis: any) {    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.referralList = [];
      this.furtherQuestionsList = [];
      this.TxService.getAITTx(payload, diagnosis).subscribe({
        next: (data: any) => {
          if (data?.result?.referral?.length > 0) {
            this.noData = false;
            this.referralList = data.result.referral.map((v: any) => ({
              referral_facility: v.referral_facility,
              referral_required: v.referral_required,
              referral_to: v.referral_to,
              remark: v.remark
            }));
          } else {
            this.noData = true;
          }
          this.isLoading = false;
        },
        error: (err: any) => {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            console.log(`Retry attempt ${retryCount} for getAITX`);
            setTimeout(() => {
              attemptDiagnosis();
            }, 1000);
          } else {
            console.error('Failed to get AI referral after 3 attempts:', err);
            this.hasError = true;
            this.isLoading = false;
            this.noData = true;
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    };

    attemptDiagnosis();
  }

  onTryAgain() {
    console.log(this.diagnosisName, "Retrying AI getAIReferralWithRetry");
    this.getAIReferralWithRetry(this.diagnosisName);
  }

  onAIReferralChange(event: any) {
    if (!event) {
      this.selectedReferral = [];
      this.referralSelected.emit([]);
      return;
    }

    if (Array.isArray(event)) {
      this.selectedReferral = [...event];
      this.referralSelected.emit(this.selectedReferral);
      return;
    }

    const index = this.selectedReferral.findIndex(r => r.referral_to === event.referral_to);
    
    if (index > -1) {
      this.selectedReferral = this.selectedReferral.filter(r => r.referral_to !== event.referral_to);
    } else {
      const referralData = {
        referral_facility: event.referral_facility,
        referral_required: event.referral_required,
        referral_to: event.referral_to,
        remark: event.remark
      };
      this.selectedReferral = [...this.selectedReferral, referralData];
    }
    this.referralSelected.emit(this.selectedReferral);
  }

  isReferralExists(referral: string): boolean {
    return this.existingReferral.some(d => d.speciality === referral);
  }

  isReferralSelected(referral): boolean {
    return this.selectedReferral.some(r => r.speciality === referral.referral_to) || this.existingReferral.some(d => d.speciality === referral.referral_to);
  }
}
