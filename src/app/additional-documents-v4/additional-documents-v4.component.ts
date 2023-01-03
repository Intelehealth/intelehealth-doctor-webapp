import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-additional-documents-v4",
  templateUrl: "./additional-documents-v4.component.html",
  styleUrls: ["./additional-documents-v4.component.scss"],
})
export class AdditionalDocumentsV4Component implements OnInit {
  @Input() pastVisit = false;
  baseURL = environment.baseURL;
  images: any = [];
  additionalDocumentPresent = false;
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";
  selectedIndex: number = 0;
  selectedImageName: string;
  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(patientUuid, this.conceptAdditionlDocument)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (
            obs.encounter !== null &&
            obs.encounter.visit.uuid === visitUuid
          ) {
            this.additionalDocumentPresent = true;
            const data = {
              image: `${this.baseURL}/obs/${obs.uuid}/value`,
            };
            this.images.push(data);
          }
        });
      });
  }

  setIndex(index,flag?) {
    if(flag) {
      this.selectedIndex = index;
    }else{
      this.selectedIndex =  this.selectedIndex + index;
    }
    this.getImage();
  }

  getImage() {
    let str = this.images.filter((f,i) => i === this.selectedIndex)[0]?.image;
    this.selectedImageName = str?.substring(str?.indexOf("obs/") + 4, str?.indexOf("/value")) + ".jpg";
    return str;
  }
}
