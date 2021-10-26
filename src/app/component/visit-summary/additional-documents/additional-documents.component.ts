import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { environment } from "../../../../environments/environment";

@Component({
  selector: "app-additional-documents",
  templateUrl: "./additional-documents.component.html",
  styleUrls: ["./additional-documents.component.css"],
})
export class AdditionalDocumentsComponent implements OnInit {
  baseURL = environment.baseURL;
  images: any = [];
  additionalDocumentPresent = false;
  imageNameData = [];
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private http: HttpClient
  ) { }

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(patientUuid, this.conceptAdditionlDocument)
      .subscribe((response) => {
        response.results.forEach(async (obs) => {
          this.additionalDocumentPresent = true;
          const data1: any = await this.diagnosisService.getImageName(patientUuid, obs.uuid).toPromise();
          const data = {
            image: `${this.baseURL}/obs/${obs.uuid}/value`,
            imageName: data1.data[0].imageName
          };
          this.images.push(data);
          // if (
          //   obs.encounter !== null &&
          //   obs.encounter.visit.uuid === visitUuid
          // ) {
          //   this.additionalDocumentPresent = true;

          //   const data1: any = await this.diagnosisService.getImageName(patientUuid, obs.uuid).toPromise();

          //   const data = {
          //     image: `${this.baseURL}/obs/${obs.uuid}/value`,
          //     imageName: data1.data[0].imageName
          //   };
          //   this.images.push(data);
          // }
        });
      });
  }
}
