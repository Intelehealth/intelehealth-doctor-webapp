import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';

@Component({
  selector: 'app-resolution-feedback',
  templateUrl: './resolution-feedback.component.html',
  styleUrls: ['./resolution-feedback.component.css']
})
export class ResolutionFeedbackComponent implements OnInit {
  resolutions: any = [];
  resolutionPresent = false;
  conceptResolutionFeedback = "dd24755d-4e7f-4175-b0d6-49f193c853c3";

  constructor(
    private route: ActivatedRoute,
    private diagnosisService: DiagnosisService
  ) { }

  ngOnInit(): void {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");

    this.diagnosisService
      .getObs(patientUuid, this.conceptResolutionFeedback)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === visitUuid) {
            this.resolutions.push(obs);
          }
        });
        if (this.resolutions !== undefined && this.resolutions.length > 0) {
          this.resolutionPresent = true;
        }
      });
  }
}

