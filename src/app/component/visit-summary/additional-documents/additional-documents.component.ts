import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { environment } from "../../../../environments/environment";
import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';

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
          let url = `${this.baseURL}/obs/${obs.uuid}/value`;
          let data2 = this.getBase64Image(url);
          const data = {
            image: `${this.baseURL}/obs/${obs.uuid}/value`,
            imageName: data1.data[0].imageName,
            data: data2
          };
          this.images.push(data);
        });
      });
  }

  download() {
    var zip = new JSZip();
    zip.file("Title");
    var imgFolder = zip.folder("images");
    for (let i = 0; i < this.images?.length; i++) {
      imgFolder.file(this.images[i].imageName, this.images[i].data, {
        base64: true
      });
    }
    zip.generateAsync({
      type: "blob"
    }).then(function (content) {
          FileSaver.saveAs(content, "Documents.zip");
    });
  }

  async getBase64Image(img) {
    var res = await fetch(img);
    var blob = await res.blob()
    return blob;
  }
}
