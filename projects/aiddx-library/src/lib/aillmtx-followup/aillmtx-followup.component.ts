import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AiTxService } from '../../services/aitx.service';

@Component({
  selector: 'lib-aillmtx-followup',
  templateUrl: './aillmtx-followup.component.html',
  styleUrls: ['./aillmtx-followup.component.scss']
})
export class AillmtxFollowupComponent {
  @Input() patientInfo: any;
  @Input() visit: any;
  @Input() existingFollowUp: any[] = [];
  @Output() followUpSelected = new EventEmitter<any[]>();
  @Input() diagnosisName: string;
  @Input() notesss: string;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  followUpList: any = []
  furtherQuestionsList: any = []
  selectedFollowUp: any[] = [];
  loggedError: string;
  
  constructor(
    private TxService: AiTxService,
  ) { }

  ngOnInit() {}

  public getAIFollowUp(diagnosis?: string) {
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);
    this.isLoading = true;
    this.followUpList = [];
    this.furtherQuestionsList = [];
    this.TxService.getAITTx(payload, diagnosis, this.visit.uuid).subscribe({
      next: (data: any) => {
        if (data.result.data.result.length > 0) {
          this.noData = false;
          this.followUpList = data.result.data.result.map(v => {
            return {
              ...v,
            }
          });
        } else {
          this.noData = true;
        }
      },
      error: (err: any) => {
        this.hasError = true;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  public getAIFollowUpWithRetry(diagnosis: any) {    
    const MAX_RETRIES = 1;
    let retryCount = 0;
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.followUpList = [];
      this.furtherQuestionsList = [];
      this.TxService.getAITTx(payload, diagnosis, this.visit.uuid).subscribe({
        next: (data: any) => {
          if (data.result.data.success && data.result.data.follow_up.length > 0 && data.result.data.follow_up[0]?.follow_up_duration) {
            this.noData = false;
            this.followUpList = data.result.data.follow_up.map(v => {
              return {
                ...v,
              }
            });
           } else if(!data.result.data.success) {
              this.hasError = true;
              this.loggedError = data.result.data?.error;
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
            this.hasError = true;
            this.isLoading = false;
            this.loggedError = err;
            console.error('Failed to get AI diagnosis after 3 attempts:', err);
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
    console.log(this.diagnosisName, "Retrying AI Follow Up");
    this.getAIFollowUpWithRetry(this.diagnosisName);
  }

  onAIFollowUpChange(event: any) {
    if (!event) {
      this.selectedFollowUp = [];
    } else if (Array.isArray(event)) {
      this.selectedFollowUp = [...event];
    } else {
      const index = this.selectedFollowUp.findIndex(f => f.reason_for_follow_up === event.reason_for_follow_up);
      if (index > -1) {
        this.selectedFollowUp = this.selectedFollowUp.filter(f => f.reason_for_follow_up !== event.reason_for_follow_up);
      } else {
        const followUpData = {
          reason_for_follow_up: event.reason_for_follow_up,
          follow_up_duration: event.follow_up_duration,
          follow_up_required: event.follow_up_required,
        };
        this.selectedFollowUp = [...this.selectedFollowUp, followUpData];
      }
    }
    this.followUpSelected.emit(this.selectedFollowUp);
  }

  isFollowUpExists(followup: string): boolean {
    return this.existingFollowUp.some(f => f.followUpReason === followup);
  }

  isFollowUpSelected(followup: any): boolean {
    return this.selectedFollowUp.some(f => f.reason_for_follow_up === followup.reason_for_follow_up) || this.existingFollowUp.some(f => f.followUpReason === followup.reason_for_follow_up);
  }
}

