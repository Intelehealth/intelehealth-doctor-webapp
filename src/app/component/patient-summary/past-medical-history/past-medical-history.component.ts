import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from './../../../services/diagnosis.service';

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
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.diagnosisService.getObs(uuid, this.conceptPastMedical)
    .subscribe(response => {
      this.pastMedical = response.results[0];
      if (this.pastMedical !== undefined) {
        this.pastMedicalHistoryPresent = true;
      }
    });
}
}

