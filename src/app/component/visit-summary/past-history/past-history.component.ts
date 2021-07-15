import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-past-history',
  templateUrl: './past-history.component.html',
  styleUrls: ['./past-history.component.css']
})
export class PastHistoryComponent implements OnInit {
  baseURL = environment.baseURL;
  pastHistory: any;
  history: any
  conceptPastHistory = '68968661-1e7a-4ea9-8ccb-571469bc659c';
  constructor(
    private route: ActivatedRoute,
    private diagnosisService: DiagnosisService
  ) { }

  ngOnInit(): void {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    this.diagnosisService.getObs(patientUuid, this.conceptPastHistory)
    .subscribe(response => {
      this.pastHistory = JSON.parse(response.results[0].value);     
    });
  }
}
