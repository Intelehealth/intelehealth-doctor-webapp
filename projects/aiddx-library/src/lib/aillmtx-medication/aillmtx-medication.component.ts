import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AiTxService } from '../../services/aitx.service';

@Component({
  selector: 'lib-aillmtx-medication',
  templateUrl: './aillmtx-medication.component.html',
  styleUrls: ['./aillmtx-medication.component.scss']
})
export class AillmtxMedicationComponent {
  @Input() patientInfo: any;
  @Input() visit: any;
  @Input() existingDiagnosis: any[] = [];
  @Output() diagnosisSelected = new EventEmitter<string[]>();
  @Input() notesss: string;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  diagnosisList: any = []
  furtherQuestionsList: any = []
  selectedDiagnosis: string[] = [];

  constructor(
    private TxService: AiTxService,
  ) { }

  ngOnInit() {}

  public getAIMedicalAdvice(notesss?: string) {
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);
    this.isLoading = true;
    this.diagnosisList = [];
    this.furtherQuestionsList = [];
    this.TxService.getAIMedicalAdvice(payload).subscribe({
      next: (data: any) => {
        if (data?.conclusion) this.conclusion = data?.conclusion;
        if (data.result.data.result.length > 0) {
          this.noData = false;
          this.diagnosisList = data.result.data.result.map(v => {
            return {
              ...v,
              diagnosis: v?.diagnosis?.replace(/\s*\(.*?\)\s*/g, ''),
              rationale: this.TxService.markdownit(v?.rationale)
            }
          });
        } else {
          this.noData = true;
        }
        if(data.result.data.further_questions.length > 0) {
          this.furtherQuestionsList = data.result.data.further_questions.map(q => {
            const key = Object.keys(q)[0];
            return q[key];
          });
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

  public getAIMedicalAdviceWithRetry(notes?: string) {
    const MAX_RETRIES = 3;
    let retryCount = 0;
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.diagnosisList = [];
      this.furtherQuestionsList = [];
      this.TxService.getAIMedicalAdvice(payload).subscribe({
        next: (data: any) => {
          if (data?.conclusion) this.conclusion = data?.conclusion;
          if (data.result.data.result.length > 0) {
            this.noData = false;
            this.diagnosisList = data.result.data.result.map(v => {
              return {
                ...v,
                diagnosis: v?.diagnosis?.replace(/\s*\(.*?\)\s*/g, ''),
                rationale: this.TxService.markdownit(v?.rationale)
              }
            });
          } else {
            this.noData = true;
          }
          if(data.result.data.further_questions.length > 0) {
            this.furtherQuestionsList = data.result.data.further_questions.map(q => {
              const key = Object.keys(q)[0];
              return q[key];
            });
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
    this.getAIMedicalAdvice(this.notesss);
  }


  onAIDiagnosisChange(event: any) {
    if (!event) {
      this.selectedDiagnosis = [];
    } else if (Array.isArray(event)) {
      this.selectedDiagnosis = [...event];
    } else {
      const index = this.selectedDiagnosis.indexOf(event);
      if (index > -1) {
        this.selectedDiagnosis = this.selectedDiagnosis.filter(d => d !== event);
      } else {
        this.selectedDiagnosis = [...this.selectedDiagnosis, event];
      }
    }
    this.diagnosisSelected.emit([...this.selectedDiagnosis]);
  }

  isDiagnosisExists(diagnosis: string): boolean {
    return this.existingDiagnosis.some(d => d.diagnosisName === diagnosis);
  }

  isDiagnosisSelected(diagnosis: string): boolean {
    return this.selectedDiagnosis.includes(diagnosis) || this.existingDiagnosis.some(d => d?.diagnosisName === diagnosis);
  }
}
