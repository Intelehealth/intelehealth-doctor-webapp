import { Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-past-visits",
  templateUrl: "./past-visits.component.html",
  styleUrls: ["./past-visits.component.css"],
})
export class PastVisitsComponent implements OnInit {
  recentVisit: any = [];
  observation: {};
  visitStatus: String;
  id;
  recent: any = [];
  constructor(
    private route: ActivatedRoute,
    private service: VisitService,
    private router: Router
  ) {}

  ngOnInit() {
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    this.service.recentVisits(patientUuid).subscribe((response) => {
      const visits = response.results;
      visits.forEach((visit) => {
        this.service.fetchVisitDetails(visit.uuid).subscribe((visitDetails) => {
          if (visitDetails?.patient?.identifiers.length) {
            this.id = visitDetails?.patient?.identifiers[0].identifier;
          }
          this.recentVisit = [];
          this.recentVisit.details = visitDetails;
          const encounters = visitDetails.encounters;
          encounters.forEach((encounter) => {
            const display = encounter.display;
            if (display.match("ADULTINITIAL") !== null) {
              const obs = encounter.obs;
              let b = " ";
              obs.forEach((res) => {
                if (res.display.match("CURRENT COMPLAINT") !== null) {
                  const currentComplaint = res.display.split("<b>");
                  for (let i = 1; i < currentComplaint.length; i++) {
                    const obs1 = currentComplaint[i].split("<");
                    if (!obs1[0].match("Associated symptoms")) {
                      b = b + " | " + obs1[0];
                      this.recentVisit.observation = b;
                    }
                  }
                }
              });
            }
          });
          if (
            visitDetails.stopDatetime === null ||
            visitDetails.stopDatetime === undefined
          ) {
            this.recentVisit.visitStatus = "Active";
          }
          this.recent.push(this.recentVisit);
        });
      });
    });
  }

  redirect(visitId) {
    window.open(`#/prescription/${visitId}/${this.id}`, "_blank");
  }
}
