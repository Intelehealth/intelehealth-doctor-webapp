import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";

@Component({
  selector: "app-physical-examination-v4",
  templateUrl: "./physical-examination-v4.component.html",
  styleUrls: ["./physical-examination-v4.component.scss"],
})
export class PhysicalExaminationV4Component implements OnInit {
  @Input() pastVisit = false;
  filtersExamination = [];
  abdomenData = [];
  generalExamsData = [];
  header: string = "";
  abdomenHeader: string = "";
  b: any;
  onExam: any = [];
  onExamPresent = false;
  conceptOnExam = "e1761e85-9b50-48ae-8c4d-e6b7eeeba084";

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
                this.abdomenData.push(j.slice(2));
              }
              break;
            } else {
              this.b = i.split("-");
              let obsData = {};
              obsData["label"] = this.b[0].slice(1);
              obsData["value"] = this.b[1];
              this.generalExamsData.push(obsData);
            }
          }
        }
      });
  }
}
