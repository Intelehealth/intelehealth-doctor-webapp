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
  @Input() existingMedication: any[] = [];
  @Output() medicationSelected = new EventEmitter<string[]>();
  @Input() notesss: string;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  medicationList: any = []
  furtherQuestionsList: any = []
  selectedMedicine: string[] = [];

  constructor(
    private TxService: AiTxService,
  ) { }

  ngOnInit() {}

  public getAIMedicalAdvice(diagnosis?: string) {
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);
    this.isLoading = true;
    this.medicationList = [];
    this.furtherQuestionsList = [];
    this.TxService.getAIMedicalAdvice(payload, diagnosis).subscribe({
      next: (data: any) => {
        if (data.result.data.result.length > 0) {
          this.noData = false;
          this.medicationList = data.result.data.result.map(v => {
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

  public getAIMedicalAdviceWithRetry(diagnosis: any) {    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.medicationList = [];
      this.furtherQuestionsList = [];
      this.TxService.getAIMedicalAdvice(payload, diagnosis).subscribe({
        next: (data: any) => {
          if (data.result.medications.length > 0) {
          console.log(data.result.medications, "ttxv1 response");
            this.noData = false;
            this.medicationList = data.result.medications.map(v => {

              return {
                ...v,
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
    this.getAIMedicalAdvice(this.notesss);
  }


  onAIMedicineChange(event: any) {
    // console.log("onAIMedicineChange", event, this.selectedMedicine);
    
    if (!event) {
      this.selectedMedicine = [];
    } else if (Array.isArray(event)) {
      this.selectedMedicine = [...event];
    } else {
      const index = this.selectedMedicine.indexOf(event);
      if (index > -1) {
        this.selectedMedicine = this.selectedMedicine.filter(d => d !== event);
      } else {
        this.selectedMedicine = [...this.selectedMedicine, event];
      }
    }
    this.medicationSelected.emit([...this.selectedMedicine]);
  }

  isMedicineExists(diagnosis: string): boolean {
    console.log("existing diagnosis", this.existingMedication, diagnosis);
    
    return this.existingMedication.some(d => d.diagnosisName === diagnosis);
  }

  isMedicineSelected(diagnosis: string): boolean {
    // console.log("selected medicine", this.selectedMedicine, diagnosis, this.existingMedication);
    
    return this.selectedMedicine.includes(diagnosis) || this.existingMedication.some(d => d?.diagnosisName === diagnosis);
  }
}
