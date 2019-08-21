import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { ImagesService } from 'src/app/services/images.service';

@Component({
  selector: 'app-additional-documents',
  templateUrl: './additional-documents.component.html',
  styleUrls: ['./additional-documents.component.css']
})
export class AdditionalDocumentsComponent implements OnInit {
image: any = [];
images: any = [];
additionalDocumentPresent = false;
conceptAdditionlDocument = '07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba';

  constructor(private diagnosisService: DiagnosisService,
    private service: ImagesService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.service.fetchAdditionalDocumentImage(patientUuid, visitUuid)
    .subscribe(response => {
      this.image = response.results;
      if (this.image.length !== 0) {
        this.additionalDocumentPresent = true;
      }
      this.image.forEach(element => {
        this.images.push(element.Image.url);
      });
    });
  }
  }
