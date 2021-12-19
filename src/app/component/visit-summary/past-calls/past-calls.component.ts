import { DiagnosisService } from './../../../services/diagnosis.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-past-calls',
  templateUrl: './past-calls.component.html',
  styleUrls: ['./past-calls.component.css']
})
export class PastCallsComponent implements OnInit {
  coOrdinatorConcept = 'cd4a9afb-3168-439e-88b4-99278548748c';
  visitUuid: string;
  patientId: string;
  allStatus = [];

  constructor(
    private route: ActivatedRoute,
    private diagnosisService: DiagnosisService
  ) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.fetchAllStatus();
  }

  fetchAllStatus() {
    this.diagnosisService.getObs(this.patientId, this.coOrdinatorConcept)
    .subscribe(allStatus => {
      if (allStatus) {
        allStatus.results.forEach(status => {
          this.allStatus.push({
            date: status.obsDatetime,
            value: status.value,
            note: ''
          });
          console.log(status);
        });
      }
    });
  }
}
