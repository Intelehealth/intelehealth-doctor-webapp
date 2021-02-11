import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";

@Component({
  selector: "app-family-history",
  templateUrl: "./family-history.component.html",
  styleUrls: ["./family-history.component.css"],
})
export class FamilyHistoryComponent implements OnInit {
  familyHistory: any = [];
  familyHistoryPresent = false;
  conceptFamilyHistory = "d63ae965-47fb-40e8-8f08-1f46a8a60b2b";

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    this.diagnosisService
      .getObs(patientUuid, this.conceptFamilyHistory)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === visitUuid) {
            this.familyHistory.push(obs);
          }
        });
        if (this.familyHistory !== undefined) {
          this.familyHistoryPresent = true;
        }
      });
  }
}
