import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AiTxService } from '../../services/aitx.service';

@Component({
  selector: 'lib-aillmtx-advice',
  templateUrl: './aillmtx-advice.component.html',
  styleUrls: ['./aillmtx-advice.component.scss']
})
export class AillmtxAdviceComponent {
  @Input() patientInfo: any;
  @Input() visit: any;
  @Input() existingAdvice: any[] = [];
  @Output() adviceSelected = new EventEmitter<string[]>();
  @Input() notesss: string;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  adviceList: any = []
  furtherQuestionsList: any = []
  selectedAdvice: string[] = [];

  constructor(
    private TxService: AiTxService,
  ) { }

  ngOnInit() {}

  public getAIAdvice(diagnosis?: string) {
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);
    this.isLoading = true;
    this.adviceList = [];
    this.furtherQuestionsList = [];
    this.TxService.getAIMedicalAdvice(payload, diagnosis).subscribe({
      next: (data: any) => {
        if (data.result.data.result.length > 0) {
          this.noData = false;
          this.adviceList = data.result.data.result.map(v => {
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

  public getAIAdviceWithRetry(diagnosis: any) {    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.adviceList = [];
      this.furtherQuestionsList = [];
      this.TxService.getAIMedicalAdvice(payload, diagnosis).subscribe({
        next: (data: any) => {
          if (data.result.medical_advice.length > 0) {
            this.noData = false;
            this.adviceList = data.result.medical_advice.map(v => {
              return {
                v
              }
            });
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
    this.getAIAdvice(this.notesss);
  }

  onAIAdviceChange(advice: any) {
    if (!advice) {
      this.selectedAdvice = [];
    } else if (Array.isArray(advice)) {
      this.selectedAdvice = [...advice];
    } else {
      if (typeof advice === 'string') {
        this.selectedAdvice = this.selectedAdvice.filter(a => a !== advice);
      } else {
        const index = this.selectedAdvice.indexOf(advice.v);
        if (index > -1) {
          this.selectedAdvice = this.selectedAdvice.filter(a => a !== advice.v);
        } else {
          this.selectedAdvice = [...this.selectedAdvice, advice.v];
        }
      }
    }
    this.adviceSelected.emit([...this.selectedAdvice]);
  }

  isAdviceExists(advice: string): boolean {
    return this.existingAdvice.some(a => a.value === advice);
  }

  isAdviceSelected(advice: any): boolean {
    return this.selectedAdvice.includes(advice.v) || this.existingAdvice.some(a => a.value === advice.v);
  }
}
