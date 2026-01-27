import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { AiTxService } from '../../services/aitx.service';

@Component({
  selector: 'lib-aillmtx-medication',
  templateUrl: './aillmtx-medication.component.html',
  styleUrls: ['./aillmtx-medication.component.scss']
})
export class AillmtxMedicationComponent implements OnInit, OnChanges {
  @Input() patientInfo: any;
  @Input() visit: any;
  @Input() existingMedication: any[] = [];
  @Output() medicationSelected = new EventEmitter<string[]>();
  @Input() diagnosisName: string;
  @Input() notesss: string;
  @Input() patientAllergies: string = '';
  @Input() patientCurrentMedications: string = '';
  @Input() allergyDataStatus: 'empty' | 'present' = 'empty';
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  medicationList: any = []
  furtherQuestionsList: any = []
  selectedMedicine: any[] = [];
  loggedError:string;
  reminderMessages: string[] = [];

  constructor(
    private TxService: AiTxService,
  ) { }

  ngOnInit() {
    this.updateReminderMessage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['patientAllergies'] || changes['patientCurrentMedications'] || changes['allergyDataStatus']) {
      this.updateReminderMessage();
    }
  }

  /**
   * Cleans medication string by removing phrases like "Name of Medications" and "Medication Name".
   * @param rawMedicationString - The raw medication string to clean.
   * @returns Cleaned medication string, or an empty string if input is invalid.
   */
  extractCleanMedicationNames(rawMedicationString: string): string {
    if (!rawMedicationString?.trim()) return '';
    let cleaned = rawMedicationString;
    cleaned = cleaned.replace(/Name\s+of\s+Medications\s*-?\s*/gi, '');
    cleaned = cleaned.replace(/Medication\s+Name\s*-?\s*/g, '');
    return cleaned.trim();
  }

  /**
   * Checks if a value indicates a negative response (e.g., "no known allergies").
   */
  isNegativeValue = (value: string): boolean => {
    if (!value?.trim()) return true;
    const lowerValue = value.toLowerCase().trim();
    const negativePatterns = [
      /^no known/i, /^no recent/i, /^none\.?$/i, /^nil\.?$/i, /^n\/a\.?$/i, /^na\.?$/i,
      /^not applicable/i, /^skipped/i, /^empty/i, /^no allergies/i, /^no medication/i,
      /^no drug/i, /patient denied/i, /has no h\/o/i
    ];

    return negativePatterns.some(pattern => pattern.test(lowerValue));
  };

  /**
   * Updates reminder messages based on patient's allergies and current medications.
   */
  updateReminderMessage(): void {
    this.reminderMessages = [];
    const hasAllergies = this.patientAllergies && !this.isNegativeValue(this.patientAllergies);
    const hasMedications = this.patientCurrentMedications && !this.isNegativeValue(this.patientCurrentMedications);
    const cleanMedications = hasMedications ? this.extractCleanMedicationNames(this.patientCurrentMedications) : '';

    if (!hasAllergies && !hasMedications) {
      this.reminderMessages.push('<strong>Allergy</strong> and <strong>Current Medication status unknown</strong> — confirmation required before prescribing.');
    } else if (hasAllergies && hasMedications) {
      this.reminderMessages.push(`Patient is currently taking <strong>${cleanMedications}</strong>, and Patient reports the following allergies to <strong>${this.patientAllergies}</strong>. Please prescribe accordingly.`);
    } else if (!hasAllergies && hasMedications) {
      this.reminderMessages.push('<strong>Allergy status unknown</strong> — confirmation required before prescribing.');
      this.reminderMessages.push(`Patient is currently taking <strong>${cleanMedications}</strong>. Please prescribe accordingly.`);
    } else if (hasAllergies && !hasMedications) {
      this.reminderMessages.push(`Patient reports the following allergies to <strong>${this.patientAllergies}</strong>. Please prescribe accordingly.`);
    }
  }

  public getAIMedical(diagnosis?: string) {
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);
    this.isLoading = true;
    this.medicationList = [];
    this.furtherQuestionsList = [];
    this.TxService.getAITTx(payload, diagnosis, this.visit.uuid).subscribe({
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

  public getAIMedicalWithRetry(diagnosis: any) {    
    const MAX_RETRIES = 1;
    let retryCount = 0;
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.medicationList = [];
      this.furtherQuestionsList = [];
      this.TxService.getAITTx(payload, diagnosis, this.visit.uuid).subscribe({
        next: (data: any) => {
          if (data.result.data.success && data.result.data.medications.length > 0) {
            this.noData = false;
            this.medicationList = data.result.data.medications.map(v => {
              return {
                ...v,
              }
            });
          } else if(!data.result.data.success) {
            this.hasError = true;
            this.loggedError = data.result.data?.error;
          }  else {
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
    this.getAIMedicalWithRetry(this.diagnosisName);
  }

  onAIMedicineChange(event: any) {
    if (!event) {
      this.selectedMedicine = [];
    } else if (Array.isArray(event)) {
      this.selectedMedicine = [...event];
    } else {
      const index = this.selectedMedicine.findIndex(m => m.name === event.name);
      if (index > -1) {
        this.selectedMedicine = this.selectedMedicine.filter(m => m.name !== event.name);
      } else {
        const medicineData = {
          name: event.name,
          dosage: event.dosage,
          frequency: event.frequency,
          duration: event.duration,
          duration_unit: event.duration_unit,
          instructions: event.instructions,
          uuid: event.uuid,
          likelihood: event.likelihood
        };
        this.selectedMedicine = [...this.selectedMedicine, medicineData];
      }
    }
    this.medicationSelected.emit(this.selectedMedicine);
  }

  isMedicineExists(medicine: string): boolean {
    return this.existingMedication.some(d => d.drug === medicine);
  }

  isMedicineSelected(medicine: any): boolean {
    return this.selectedMedicine.some(m => m.name === medicine.name) || this.existingMedication.some(d => d.drug === medicine.name);
  }
}
