import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "src/app/services/diagnosis.service";

@Component({
  selector: "app-check-up-reason-v4",
  templateUrl: "./check-up-reason-v4.component.html",
  styleUrls: ["./check-up-reason-v4.component.scss"],
})
export class CheckUpReasonV4Component implements OnInit {
  @Input() pastVisit = false;
  filters = [];
  b: any;
  complaintsData = [];
  mainObs = {};
  complaint: any = [];
  conceptComplaint = "3edb0e09-9135-481e-b8f0-07a26fa9a5ce";
  header: string = "";
  symptoms: string = "";
  symptomsData = [];

  constructor(
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.diagnosisService
      .getObs(patientUuid, this.conceptComplaint)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter.visit.uuid === visitUuid) {
            this.complaint.push(obs);
          }
        });

        if (this.complaint.length > 0 && this.complaint !== undefined) {
          this.filters = this.complaint[0].value.split("<br/>");
          for (let i of this.filters) {
            if (this.filters[0] == i) {
              this.header = i.slice(4, -6);
            } else if (i == " ►<b>Associated symptoms</b>: ") {
              this.symptoms = i.slice(5, -6);
              let Idex = this.filters.slice(this.filters.indexOf(i) + 1, -1);
              for (let j of Idex) {
                let obsData = {};
                if (Idex.indexOf(j) % 2 == 0) {
                  obsData["label"] = j.slice(2, -2);
                } else {
                  obsData["value"] = j;
                }
                this.symptomsData.push(obsData);
              }
              break;
            } else {
              this.b = i.split(" - ");
              let obsData = {};
              obsData["label"] = this.b[0].slice(1);
              obsData["value"] = this.b[1];
              this.complaintsData.push(obsData);
            }
          }
        }
      });
  }
}
