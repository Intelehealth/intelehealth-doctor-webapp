import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";

@Component({
  selector: "app-medical-history-v4",
  templateUrl: "./medical-history-v4.component.html",
  styleUrls: ["./medical-history-v4.component.scss"],
})
export class MedicalHistoryV4Component implements OnInit {
  @Input() pastVisit = false;
  patientHistory = [];
  familyHistory = [];
  filterPatient: any;
  filterFamily: any;
  data: any;
  pastMedical: any = [];
  pastMedicalHistoryPresent = false;
  conceptPastMedical = "62bff84b-795a-45ad-aae1-80e7f5163a82";
  familyHistoryData: any = [];
  familyHistoryDataPresent = false;
  conceptFamilyHistoryData = "d63ae965-47fb-40e8-8f08-1f46a8a60b2b";

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(patientUuid, this.conceptPastMedical)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === visitUuid) {
            this.pastMedical.push(obs);
          }
        });

        if (this.pastMedical.length > 0 && this.pastMedical !== undefined) {
          this.filterPatient = this.pastMedical[0].value.split("<br/>");
          for (let i of this.filterPatient) {
            this.data = i.split(" - ");
            let obsData = {};
            obsData["label"] = this.data[0].slice(1);
            obsData["value"] = this.data[1];
            this.patientHistory.push(obsData);
          }
        }
      });

    this.diagnosisService
      .getObs(patientUuid, this.conceptFamilyHistoryData)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === visitUuid) {
            this.familyHistoryData.push(obs);
          }
        });
        if (
          this.familyHistoryData !== undefined &&
          this.familyHistoryData.length > 0
        ) {
          let a = this.familyHistoryData[0].value.split(":");
          this.filterFamily = a[1].split(", ");
          let obsData = {};
          if (this.filterFamily.length >= 2) {
            if (this.filterFamily[1].slice(0, 7) == "Father.") {
              obsData["label"] = this.filterFamily[0];
              obsData["value"] = this.filterFamily[1].slice(0, 7);
              this.familyHistory.push(obsData);
            } else {
              obsData["label"] = this.filterFamily[0];
              obsData["value"] = this.filterFamily[1].slice(0, -5);
              this.familyHistory.push(obsData);
            }
          } else {
            obsData["label"] = this.filterFamily[0].slice(0, -6);
            this.familyHistory.push(obsData);
          }
        }
      });
  }
}
