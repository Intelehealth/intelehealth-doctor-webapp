import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";

@Component({
  selector: "app-on-examination",
  templateUrl: "./on-examination.component.html",
  styleUrls: ["./on-examination.component.css"],
})
export class OnExaminationComponent implements OnInit {
  @Input() visit_Id;
  @Output() isExamPresent = new EventEmitter();
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
            if(obs.value.toString().startsWith("{")) {
              let value = JSON.parse(obs.value.toString());
              obs.value = value["en"];
              if(!obs.value.includes("</b><br/>•  -")) {
                const value = obs.value.replace('<b>General exams: </b><br/>• Tele-counseling-<br/>','');
                value && this.onExam.push(value);
              }
            } else {
              if(!obs.value.includes("</b><br/>•  -")) {
                const value = obs.value.replace('<b>General exams: </b><br/>• Tele-counseling-<br/>','');
                value && this.onExam.push(value);
              }
            }
          }
        });
        if (this.onExam !== undefined && this.onExam.length > 0) {
          this.onExamPresent = true;
        }
        this.isExamPresent.emit({"visitId": this.visit_Id, "isPresent": this.onExamPresent});
      });
  }
}
