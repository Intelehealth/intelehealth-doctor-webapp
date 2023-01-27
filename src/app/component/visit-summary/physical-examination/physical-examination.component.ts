import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { animate, style, transition, trigger, AnimationEvent } from '@angular/animations';


@Component({
  selector: 'app-physical-examination',
  templateUrl: './physical-examination.component.html',
  styleUrls: ['./physical-examination.component.scss'],
  animations: [
    trigger('animation', [
      transition('void => visible', [
        style({transform: 'scale(0.5)'}),
        animate('150ms', style({transform: 'scale(1)'}))
      ]),
      transition('visible => void', [
        style({transform: 'scale(1)'}),
        animate('150ms', style({transform: 'scale(0.5)'}))
      ]),
    ]),
    trigger('animation2', [
      transition(':leave', [
        style({opacity: 1}),
        animate('50ms', style({opacity: 0.8}))
      ])
    ])
  ]
})
export class PhysicalExaminationComponent implements OnInit {
  baseURL = environment.baseURL;
  images: any = [];
  previewImage = false;
  showMask = false;
  currentLightboxImage: any = this.images[0];
  currentIndex = 0;
  totalImageCount = 0;

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
        if (obs.encounter !== null && obs.encounter.visit.uuid === visitUuid) {
          this.physicalExamPresent = true;
          const data = {
            image: `${this.baseURL}/obs/${obs.uuid}/value`
            };
          this.images.push(data);
          this.totalImageCount = this.images.length;
          console.log(this.images,this.totalImageCount);
          
        }
      });
    });
  }

  onPreviewImage(index: number): void {
    this.showMask = true;
    this.previewImage = true;
    this.currentIndex = index;
    this.currentLightboxImage = this.images[index];
  }

  onAnimationEnd(event: AnimationEvent) {
    if(event.toState === 'void') {
      this.showMask = false;
    }
  }

  onClosePreview() {
    this.previewImage = false;
  }

  next(): void {
    this.currentIndex = this.currentIndex + 1;
    if(this.currentIndex > this.images.length - 1) {
      this.currentIndex = 0;
    }
    this.currentLightboxImage = this.images[this.currentIndex];
  }

  prev(): void {
    this.currentIndex = this.currentIndex - 1;
    if(this.currentIndex < 0) {
      this.currentIndex = this.images.length - 1;
    }
    this.currentLightboxImage = this.images[this.currentIndex];
  }
}
