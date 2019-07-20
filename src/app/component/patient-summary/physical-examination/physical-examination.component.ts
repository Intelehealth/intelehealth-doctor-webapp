import { LoginPageComponent } from './../../login-page/login-page.component';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-physical-examination',
  templateUrl: './physical-examination.component.html',
  styleUrls: ['./physical-examination.component.css']
})
export class PhysicalExaminationComponent implements OnInit {
  // baseURL = window.location.host;
baseURL = '13.233.50.223:8080';
image: any = [];
images: any = [];
physicalExamPresent = false;
conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';

  constructor(private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.diagnosisService.getObs(patientUuid, this.conceptPhysicalExamination)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === visitUuid) {
          this.physicalExamPresent = true;
          const data = {
            image: `http://${this.baseURL}/openmrs/ws/rest/v1/obs/${obs.uuid}/value`
            };
          this.images.push(data);
        }
      });
    });
  }
  }
