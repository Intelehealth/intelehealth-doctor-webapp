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
  constructor(private service: ImagesService,
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
