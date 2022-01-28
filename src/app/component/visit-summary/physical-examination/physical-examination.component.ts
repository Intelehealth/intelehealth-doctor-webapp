import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-physical-examination',
  templateUrl: './physical-examination.component.html',
  styleUrls: ['./physical-examination.component.css']
})
export class PhysicalExaminationComponent implements OnInit {
  @Output() isDataPresent = new EventEmitter<boolean>();
  baseURL = environment.baseURL;
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
        if (response?.results?.length > 0) {
          response.results.forEach(obs => {
            if (obs.encounter !== null && obs.encounter.visit.uuid === visitUuid) {
              this.physicalExamPresent = true;
              this.isDataPresent.emit(true);
              const data = {
                image: `${this.baseURL}/obs/${obs.uuid}/value`
              };
              this.images.push(data);
            } else {
              this.isDataPresent.emit(false);
            }
          });
        } else {
          this.isDataPresent.emit(false);
        }
      });
  }
}
