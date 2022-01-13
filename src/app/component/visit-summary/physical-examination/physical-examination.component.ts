import { ImagesService } from 'src/app/services/images.service';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
declare var saveToStorage: any;

@Component({
  selector: 'app-physical-examination',
  templateUrl: './physical-examination.component.html',
  styleUrls: ['./physical-examination.component.css']
})
export class PhysicalExaminationComponent implements OnInit {
  baseURL = environment.baseURL;
  images: any = [];
  physicalExamPresent = false;
  conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';

  constructor(private diagnosisService: DiagnosisService,
              private imagesService: ImagesService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.imagesService.fetchPhyImages(patientUuid, visitUuid)
    .subscribe(response => {
      if (response.data.length) {
        this.physicalExamPresent = true;
        saveToStorage('physicalImages', response.data);
        response.data.forEach(image => {
          const data = {
            image: image.image_path,
            id: image.id,
            efficient: image.efficient
          };
          this.images.push(data);
        });
      }
    });
    // this.diagnosisService.getObs(patientUuid, this.conceptPhysicalExamination)
    // .subscribe(response => {
    //   response.results.forEach(obs => {
    //     if (obs.encounter !== null && obs.encounter.visit.uuid === visitUuid) {
    //       this.physicalExamPresent = true;
    //       const data = {
    //         image: `${this.baseURL}/obs/${obs.uuid}/value`
    //         };
    //       this.images.push(data);
    //     }
    //   });
    // });
  }

  onChangeHandler(id, type) {
    const payload = {
      efficient: type
    };
    this.imagesService.saveQuality(id, payload)
    .subscribe(response => {});
  }
}
