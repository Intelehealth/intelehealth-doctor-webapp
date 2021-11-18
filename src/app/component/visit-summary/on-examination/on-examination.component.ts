import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";

@Component({
  selector: "app-on-examination",
  templateUrl: "./on-examination.component.html",
  styleUrls: ["./on-examination.component.css"],
})
export class OnExaminationComponent implements OnInit {
  @Input() visit_Id;
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
          if (obs.encounter.visit.uuid === this.visit_Id) {
            if(!obs.value.includes("</b><br/>•  -")) {
              this.onExam.push(obs);
            }
          }
        });
        if (this.onExam !== undefined && this.onExam.length > 0) {
          this.onExamPresent = true;
        }
      });
  }
}
