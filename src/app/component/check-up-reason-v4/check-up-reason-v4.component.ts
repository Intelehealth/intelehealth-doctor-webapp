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
  complaintsData = [];
  mainObs = {};
  complaint: any = [];
  conceptComplaint = "3edb0e09-9135-481e-b8f0-07a26fa9a5ce";
  headers =[];
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
            const currentComplaint = this.complaint[0].value.split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match('Associated symptoms')) {
                this.headers.push(obs1[0]);
              } 
            }
          this.filters = this.complaint[0].value.split("<br/>");
          for (let i of this.filters) {
            if (i == " ►<b>Associated symptoms</b>: ") {
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
              let b = i.split(" - ");
              let obsData = {};
              if(!b[0].includes("<b>")) {
                obsData["label"] = b[0].slice(1);
                obsData["value"] = b[1] ? b[1] : 'None';
              } else {
                obsData["label"] = b[0];
              }
              this.complaintsData.push(obsData);
            }
          }
        }
      });
  }
}
