import { Component, OnInit } from '@angular/core';
import { AdditionalDocumentsService } from './../../../services/additional-documents.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-additional-documents',
  templateUrl: './additional-documents.component.html',
  styleUrls: ['./additional-documents.component.css']
})
export class AdditionalDocumentsComponent implements OnInit {
image: any = [];
images: any = [];
additionalDocumentPresent = false;

  constructor(private service: AdditionalDocumentsService,
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

