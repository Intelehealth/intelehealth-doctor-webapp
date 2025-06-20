import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AiTxService } from '../../services/aitx.service';

@Component({
  selector: 'lib-aillmtx-test',
  templateUrl: './aillmtx-test.component.html',
  styleUrls: ['./aillmtx-test.component.scss']
})
export class AillmtxTestComponent {
  @Input() patientInfo: any;
  @Input() visit: any;
  @Input() existingTest: any[] = [];
  @Output() testSelected = new EventEmitter<string[]>();
  @Input() diagnosisName: string;
  @Input() notesss: string;
  isLoading = false;
  hasError = false;
  noData = false;
  insufficientData = false;
  conclusion: string = '';
  testList: any = []
  furtherQuestionsList: any = []
  selectedTest: string[] = [];

  constructor(
    private TxService: AiTxService,
  ) { }

  ngOnInit() {}

  public getAITest(diagnosis?: string) {
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);
    this.isLoading = true;
    this.testList = [];
    this.furtherQuestionsList = [];
    this.TxService.getAITTx(payload, diagnosis, this.visit).subscribe({
      next: (data: any) => {
        if (data.result.data.result.length > 0) {
          this.noData = false;
          this.testList = data.result.data.result.map(v => {
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

  public getAITestWithRetry(diagnosis: any) {    
    const MAX_RETRIES = 3;
    let retryCount = 0;
    const payload = this.TxService.getTxPayload(this.patientInfo, this.visit);

    const attemptDiagnosis = () => {
      this.isLoading = true;
      this.testList = [];
      this.furtherQuestionsList = [];
      this.TxService.getAITTx(payload, diagnosis, this.visit).subscribe({
        next: (data: any) => {
          if (data.result.tests_to_be_done.length > 0) {
            this.noData = false;
            this.testList = data.result.tests_to_be_done.map(v => {
              console.log('Test:', {...v});
              console.log('Test Reason:', v?.test_reason);
              
              console.log(this.TxService.markdownit(v?.test_reason));
              
              return {
                ...v,
                rationale: this.TxService.markdownit(v?.rationale)
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
    this.getAITestWithRetry(this.diagnosisName)
  }

  onAITestChange(test: any) {
    if (!test) {
      this.selectedTest = [];
    } else if (Array.isArray(test)) {
      this.selectedTest = test.map(t => t.test_name || t);
    } else {
      const testName = test.test_name || test;
      if (this.selectedTest.includes(testName)) {
        this.selectedTest = this.selectedTest.filter(t => t !== testName);
      } else {
        this.selectedTest = [...this.selectedTest, testName];
      }
    }
    this.testSelected.emit([...this.selectedTest]);
  }

  isTestExists(test: string): boolean {
    return this.existingTest.some(a => a.value === test);
  }

  isTestSelected(test: any): boolean {
    const testName = test.test_name || test;
    return this.selectedTest.includes(testName) || this.existingTest.some(a => a.value === testName);
  }
}
