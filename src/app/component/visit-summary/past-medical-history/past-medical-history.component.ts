import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from '../../../services/diagnosis.service';

@Component({
  selector: 'app-past-medical-history',
  templateUrl: './past-medical-history.component.html',
  styleUrls: ['./past-medical-history.component.css']
})
export class PastMedicalHistoryComponent implements OnInit {
pastMedical: any = [];
pastMedicalHistoryPresent = false;
conceptPastMedical = '62bff84b-795a-45ad-aae1-80e7f5163a82';

  constructor(private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.diagnosisService.getObs(patientUuid, this.conceptPastMedical)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === visitUuid) {
          this.pastMedical.push(obs);
        }
      });
      if (this.pastMedical !== undefined) {
        this.pastMedicalHistoryPresent = true;
      }
    });
}
}

