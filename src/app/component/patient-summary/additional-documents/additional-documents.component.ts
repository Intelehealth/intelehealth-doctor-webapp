import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-additional-documents',
  templateUrl: './additional-documents.component.html',
  styleUrls: ['./additional-documents.component.css']
})
export class AdditionalDocumentsComponent implements OnInit {
baseURL = environment.baseURL;
images: any = [];
additionalDocumentPresent = false;
conceptAdditionlDocument = '07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba';

  constructor(private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.diagnosisService.getObs(patientUuid, this.conceptAdditionlDocument)
    .subscribe(response => {
      response.results.forEach(obs => {
      if (obs.encounter.visit.uuid === visitUuid) {
      this.additionalDocumentPresent = true;
      const data = {
        image: `${this.baseURL}/obs/${obs.uuid}/value`
        };
        this.images.push(data);
      }
      });
    });
  }
  }

