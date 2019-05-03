import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';


@Component({
  selector: 'app-family-history',
  templateUrl: './family-history.component.html',
  styleUrls: ['./family-history.component.css']
})
export class FamilyHistoryComponent implements OnInit {
familyHistory: any = [];
conceptFamilyHistory = 'd63ae965-47fb-40e8-8f08-1f46a8a60b2b';

  constructor(private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.diagnosisService.getObs(uuid, this.conceptFamilyHistory)
    .subscribe(response => {
      this.familyHistory = response.results[0];
    });
  }
}
