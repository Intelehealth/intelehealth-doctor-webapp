import { Component, Input, Output, EventEmitter, Optional, Inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AiddxService } from '../../services/aiddx.service';
import { MatDialog } from '@angular/material/dialog';
// import { dummyPayload, response } from '../token';
import { ENVIRONMENT } from "../../lib/token";

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
  @Output() furtherQuestionsListReceived = new EventEmitter<any[]>();
  @Output() diagnosisReceived = new EventEmitter<any[]>();
  @Output() rationaleOpened = new EventEmitter<any>();
  @Input() notes: string;
  @Input() visitCompleted: boolean = false;
  @Input() reportExpanded = false;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  isActive = false;
  conclusion: string = '';
  treatment: string = '';
  menuContent: string = '';
  diagnosisName: any = [];
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
  furtherQuestionsList: any = []
  selectedDiagnosis: string[] = [];
  apiResponseChanged: boolean = false;

  constructor(
    private ddxSvc: AiddxService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    @Optional() @Inject(ENVIRONMENT) private env?: any
  ) { 
    if (!this.env) {
      console.warn("ENVIRONMENT is not provided!");
    }
  }

  ngOnInit() {}

  public getAIDiagnosis(notes?: string) {
    const payload = this.ddxSvc.getDDxPayload(this.patientInfo, this.visit, notes);
    this.isLoading = true;
    this.diagnosisList = [];
    this.furtherQuestionsList = [];
    this.ddxSvc.getAIDiagnosis(payload, this.visit.uuid, this.visitCompleted).subscribe({
      next: (data: any) => {
        // if (!this.isValidDdxResponse(data)) {
        //   this.apiResponseChanged = true;
        //   return false;
        // }
        if (data?.conclusion) this.conclusion = data?.conclusion;
        if (data?.result?.data?.result?.length > 0) {
          this.noData = false;
          const mapped = data.result.data.result.map(v => {
            // When summarised_rationale is missing, generate from rationale values
            let summarised = v?.summarised_rationale;
            // if (!summarised?.length && Array.isArray(v?.rationale)) {
            //   summarised = v.rationale.flatMap(obj => Object.values(obj));
            // }
            return {
              ...v,
              diagnosis: v?.diagnosis,
              summarised_rationale: summarised,
              rationale: v?.rationale
            }
          });
          this.diagnosisList = this.visitCompleted
            ? mapped.filter(v => { const rank = Number(v?.rank); return rank >= 1 && rank <= 5; }).sort((a, b) => Number(a.rank) - Number(b.rank))
            : mapped;
          this.diagnosisReceived.emit(this.diagnosisList);
          if(data?.result?.data?.further_questions?.length > 0) {
            this.furtherQuestionsList = data.result.data.further_questions.map(q => {
              const key = Object.keys(q)[0];
              return q[key];
            });
            this.furtherQuestionsListReceived.emit(this.furtherQuestionsList);
          }
        } else {
          this.noData = true;
        }
        this.isLoading = false;
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

  public getAIDiagnosisWithRetry(notes?: string) {
    const MAX_RETRIES = 3;
    let retryCount = 0;
    const payload = this.ddxSvc.getDDxPayload(this.patientInfo, this.visit, notes);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.diagnosisList = [];
      this.furtherQuestionsList = [];
      this.ddxSvc.getAIDiagnosis(payload, this.visit.uuid, this.visitCompleted).subscribe({
        next: (data: any) => {
          // if (!this.isValidDdxResponse(data)) {
          //   this.apiResponseChanged = true;
          //   return false;
          // }
          if (data?.conclusion) this.conclusion = data?.conclusion;
          if (data?.result?.data?.result?.length > 0) {
            this.noData = false;
            const mapped = data.result.data.result.map(v => {
              // let summarised = v?.summarised_rationale;
              // if (!summarised?.length && Array.isArray(v?.rationale)) {
              //   summarised = v.rationale.flatMap(obj => Object.values(obj));
              // }
              return {
                ...v,
                diagnosis: v?.diagnosis,
                summarised_rationale: v?.summarised_rationale,
                rationale: v?.rationale
              }
            });
            this.diagnosisList = this.visitCompleted
              ? mapped.filter(v => { const rank = Number(v?.rank); return rank >= 1 && rank <= 5; }).sort((a, b) => Number(a.rank) - Number(b.rank))
              : mapped;
            this.diagnosisReceived.emit(this.diagnosisList);
            if(data?.result?.data?.further_questions?.length > 0) {
              this.furtherQuestionsList = data.result.data.further_questions.map(q => {
                const key = Object.keys(q)[0];
                return q[key];
              });
              this.furtherQuestionsListReceived.emit(this.furtherQuestionsList);
            }
          } else {
            this.noData = true;
          }
          this.isLoading = false;
        },
        error: (err: any) => {
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            console.warn('[AILLMDDX] Retry attempt scheduled', { retryAfterMs: 1000, nextAttempt: retryCount + 1 });
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

  onReportOpened() {
    this.rationaleOpened.emit({ diagnosis_count: this.diagnosisList?.length || 0 });
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

  setMenuContent(title: any, likelihood: any, item: any) {
    this.menuContent = item.flatMap(obj =>
      Object.entries(obj).map(([key, value]) => ({ key, value }))
    );
    this.diagnosisName = [title, likelihood]
    return
  }

  private isValidDdxResponse(data: any): boolean {
    if (!data || typeof data !== 'object') return false;

    const resultArray = data?.result?.data?.result;
    const furtherQuestions = data?.result?.data?.further_questions;
    const conclusionTop = data?.conclusion;
    const conclusionNested = data?.result?.data?.conclusion;

    // Check if resultArray is valid
    const resultArrayValid = Array.isArray(resultArray);
    if (!resultArrayValid) {
      this.toastr.error('Please refresh the page to try again. If issue persists contact Tech Support', 'AI recommendation could not be generated.');
    }

    // Validate each result item
    const itemsValid = resultArray.every((item: any, idx: number) => {
      const diagnosisOk = typeof item?.diagnosis === 'string' && item.diagnosis.length > 0;
      const likelihoodOk = typeof item?.likelihood === 'string' && item.likelihood.length > 0;
      const rationaleOk = Array.isArray(item?.rationale) && item.rationale.every((r: any) => r && typeof r === 'object' && !Array.isArray(r));
      const summarisedOk = Array.isArray(item?.summarised_rationale) && item.summarised_rationale.every((s: any) => typeof s === 'string');
      const ok = diagnosisOk && likelihoodOk && rationaleOk && summarisedOk;
      if (!ok) {
        console.error('[AILLMDDX] Invalid result item at index', idx, { item });
        this.toastr.error(`Invalid result item at index ${idx}`, 'API response format of "result.items" has changed.');

      }
      return ok;
    });

    // Validate further questions
    const furtherQuestionsValid = furtherQuestions === undefined || Array.isArray(furtherQuestions);
    if (!furtherQuestionsValid) {
      this.toastr.error('Please refresh the page to try again. If issue persists contact Tech Support', 'AI recommendation could not be generated.');
    }

    // Validate conclusion
    const conclusionValid = (conclusionTop === undefined || typeof conclusionTop === 'string') && (conclusionNested === undefined || typeof conclusionNested === 'string');
    if (!conclusionValid) {
      this.toastr.error('Please refresh the page to try again. If issue persists contact Tech Support', 'AI recommendation could not be generated.');
    }

    return itemsValid && furtherQuestionsValid && conclusionValid;
  }

  // In your component class
  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null;
  }
}
