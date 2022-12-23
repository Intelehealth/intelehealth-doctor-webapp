import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";
import { DiagnosisService } from "../services/diagnosis.service";

@Component({
  selector: "app-physical-examination-v4",
  templateUrl: "./physical-examination-v4.component.html",
  styleUrls: ["./physical-examination-v4.component.scss"],
})
export class PhysicalExaminationV4Component implements OnInit {
  @Input() pastVisit = false;
  baseURL = environment.baseURL;
  filtersExamination = [];
  abdomenData = [];
  generalExamsData = [];
  header: string = "";
  abdomenHeader: string = "";
  onExam: any = [];
  onExamPresent = false;
  images: any = [];
  conceptOnExam = "e1761e85-9b50-48ae-8c4d-e6b7eeeba084";
  conceptPhysicalExamination = '200b7a45-77bc-4986-b879-cc727f5f7d5b';

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(patientUuid, this.conceptOnExam)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === visitUuid) {
            this.onExam.push(obs);
          }
        });

        if (this.onExam.length > 0) {
          this.filtersExamination = this.onExam[0].value.split("<br/>");
          for (let i of this.filtersExamination) {
            if (this.filtersExamination[0] == i) {
              this.header = i.slice(3, -6);
            } else if (i == "<b>Abdomen: </b>") {
              this.abdomenHeader = i.slice(3, -6);
              let Idex = this.filtersExamination.slice(
                this.filtersExamination.indexOf(i) + 1
              );
              for (let j of Idex) {
                if(!j.includes("<b>")) {
                  this.abdomenData.push(j.slice(2));
                } else{
                  this.abdomenData.push(j);
                }
              }
              break;
            } else {
              let b = i.split("-");
              let obsData = {};
              if(!b[0].includes("<b>")) {
                obsData["label"] = b[0].slice(1);
                obsData["value"] = b[1] ? b[1] : 'None';
              } else {
                obsData["label"] = b[0];
              }
              this.generalExamsData.push(obsData);
            }
          }
        }
      });

      this.diagnosisService.getObs(patientUuid, this.conceptPhysicalExamination)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter !== null && obs.encounter.visit.uuid === visitUuid) {
            const data = {
              image: `${this.baseURL}/obs/${obs.uuid}/value`
              };
            this.images.push(data);
          }
        });
      });
  }
}
