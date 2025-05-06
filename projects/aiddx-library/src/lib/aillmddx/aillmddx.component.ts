import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AiddxService } from '../../services/aiddx.service';
// import { dummyPayload, response } from '../token';

@Component({
  selector: 'app-aillmddx',
  templateUrl: './aillmddx.component.html',
  styleUrls: ['./aillmddx.component.scss']
})
export class AillmddxComponent {
  @Input() patientInfo: any;
  @Input() visit: any;
  @Input() existingDiagnosis: any[] = [];
  @Output() diagnosisSelected = new EventEmitter<string[]>();
  @Input() notes: string;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  questions = [
    {
      title: 'Key symptoms and their characteristics',
      items: [
        'Can you describe the rash in more detail?',
        'Are there any blackheads or whiteheads?',
        'Does the rash itch or burn? Does it get worse after sweating or sun exposure?',
        'When you say the rash is transient, how long does it last before disappearing?',
        'Does it reappear in the same location?'
      ]
    },
  ];
  diagnosisList: any = []
  selectedDiagnosis: string[] = [];

  constructor(
    private ddxSvc: AiddxService,
  ) { }

  ngOnInit() {}

  public getAIDiagnosis(notes?: string) {
    const payload = this.ddxSvc.getDDxPayload(this.patientInfo, this.visit, notes);
    this.isLoading = true;
    this.diagnosisList = [];
    this.ddxSvc.getAIDiagnosis(payload).subscribe({
      next: (data: any) => {
        if (data?.conclusion) this.conclusion = data?.conclusion;
        if (data.result.length > 0) {
          this.noData = false;
          this.diagnosisList = data.result.map(v => {
            return {
              ...v,
              diagnosis: v?.diagnosis?.replace(/\s*\(.*?\)\s*/g, ''),
              rationale: this.ddxSvc.markdownit(v?.rationale)
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

    // setTimeout(() => {
    //   if (response.result.length > 0) {
    //     this.noData = false;
    //     this.conclusion = response?.conclusion;
    //     this.diagnosisList = response.result.map(v => ({ ...v, diagnosis: v?.diagnosis?.replace(/\s*\(.*?\)\s*/g, '') }));
    //   } else {
    //     this.noData = true;
    //   }
    //   this.isLoading = false;
    // }, 3000);
  }

  public getAIDiagnosisWithRetry(notes?: string) {
    const MAX_RETRIES = 3;
    let retryCount = 0;
    const payload = this.ddxSvc.getDDxPayload(this.patientInfo, this.visit, notes);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.diagnosisList = [];

      this.ddxSvc.getAIDiagnosis(payload).subscribe({
        next: (data: any) => {
          if (data?.conclusion) this.conclusion = data?.conclusion;
          if (data.result.length > 0) {
            this.noData = false;
            this.diagnosisList = data.result.map(v => {
              return {
                ...v,
                diagnosis: v?.diagnosis?.replace(/\s*\(.*?\)\s*/g, ''),
                rationale: this.ddxSvc.markdownit(v?.rationale)
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
            console.log(`Retry attempt ${retryCount} for getAIDiagnosis`);
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
    this.getAIDiagnosis(this.notes);
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
