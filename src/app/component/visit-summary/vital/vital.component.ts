import { VisitService } from "src/app/services/visit.service";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { EncounterService } from "src/app/services/encounter.service";

@Component({
  selector: "app-vital",
  templateUrl: "./vital.component.html",
  styleUrls: ["./vital.component.css"],
})
export class VitalComponent implements OnInit {
  answer: any = [];
  v: any = [];
  vitalsPresent = false;
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private service: EncounterService
  ) {}

  ngOnInit() {
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService.fetchVisitDetails(visitUuid).subscribe((visits) => {
      visits.encounters.forEach((visit) => {
        const display = visit.display;
        if (visit.display.match("Vitals") !== null) {
          this.vitalsPresent = true;
          this.answer.date = display.split(" ")[1];
          const vitalUUID = visit.uuid;
          this.service.vitals(vitalUUID).subscribe((vitals) => {
            const vital = vitals.obs;
            vital.forEach((obs) => {
              const displayObs = obs.display;
              if (displayObs.includes("SYSTOLIC")) {
                this.answer.sbp = Number(
                  obs.display.slice(25, obs.display.length)
                );
              }
              if (displayObs.includes("DIASTOLIC")) {
                this.answer.dbp = Number(
                  obs.display.slice(26, obs.display.length)
                );
              }
              if (displayObs.includes("Weight")) {
                this.answer.weight = Number(
                  obs.display.slice(13, obs.display.length)
                );
              }
              if (displayObs.includes("Height")) {
                this.answer.height = Number(
                  obs.display.slice(13, obs.display.length)
                );
              }
              if (displayObs.includes("BLOOD OXYGEN SATURATION")) {
                this.answer.sp02 = Number(
                  obs.display.slice(25, obs.display.length)
                );
              }
              if (displayObs.includes("TEMP")) {
                this.answer.temp = Number(
                  obs.display.slice(17, obs.display.length)
                );
              }
              if (displayObs.includes("Pulse")) {
                this.answer.pulse = Number(
                  obs.display.slice(7, obs.display.length)
                );
              }
              if (displayObs.includes("Respiratory rate")) {
                this.answer.respiratoryRate = Number(
                  obs.display.slice(18, obs.display.length)
                );
              }
              if (displayObs.includes("HGB")) {
                this.answer.hgb = obs.value;
              }
              if (displayObs.includes("Blood Group")) {
                this.answer.group = obs.value;
              }
              if (displayObs.includes("Sugar Level - Fasting")) {
                this.answer.sugarLevelFasting = obs.value;
              }
              if (displayObs.includes("Sugar Level - After Meal")) {
                this.answer.sugarLevelAfterMeal = obs.value;
              }
              if (displayObs.includes("Sugar Level - Random")) {
                this.answer.sugarLevelRandom = obs.value;
              }
            });
            this.v.push(this.answer);
          });
        }
      });
    });
  }
}
