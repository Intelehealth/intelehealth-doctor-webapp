import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImagesService } from 'src/app/services/images.service';

@Component({
  selector: 'app-physical-examination',
  templateUrl: './physical-examination.component.html',
  styleUrls: ['./physical-examination.component.css']
})
export class PhysicalExaminationComponent implements OnInit {
image: any = [];
images: any = [];
physicalExamPresent = false;
conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';

  constructor(private service: ImagesService,
              private diagnosisService: DiagnosisService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.service.fetchphysicalExamImage(patientUuid, visitUuid)
    .subscribe(response => {
      this.image = response.results;
      if (this.image.length !== 0) {
        this.physicalExamPresent = true;
      }
      this.image.forEach(element => {
        this.images.push(element.Image.url);
    });
  });
  }
}
