import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';

@Component({
  selector: 'app-facility',
  templateUrl: './facility.component.html',
  styleUrls: ['./facility.component.css']
})
export class FacilityComponent implements OnInit {
  @Input() visit_Id;
  facilities: any = [];
  facilityPresent = false;
  conceptFacilityFeedback = "0d3336f1-df6c-48ab-a7a3-c93b1054b7b7";

  constructor(
    private route: ActivatedRoute,
    private diagnosisService: DiagnosisService
  ) { }

  ngOnInit(): void {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");

    this.diagnosisService
      .getObs(patientUuid, this.conceptFacilityFeedback)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === this.visit_Id) {
            if(obs.value.includes("|")) {
              let value = obs.value.replace("|"," <br><br> ");
              obs.value = value;
            }
            this.facilities.push(obs);
          }
        });
        if (this.facilities !== undefined && this.facilities.length > 0) {
          this.facilityPresent = true;
        }
      });
  }
}

