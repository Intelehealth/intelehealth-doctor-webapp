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
  ) { }

  toFeet(n: any) {
    const realFeet = ((n * 0.393700) / 12);
    const feet = Math.floor(realFeet);
    const inches = Math.round((realFeet - feet) * 12);
    return `${feet} ft ${inches} inches`;
  }

  getSystolicColor(n: any) {
    let code: string = '#FF0000';
    if (n >= 90 && n < 120) {
      code = '#008000';
    } else if (n >= 120 && n <= 139) {
      code = '#FFFF00';
    }
    return code;
  }

  getDSystolicColor(n: any) {
    let code: string = '#FF0000';
    if (n < 80) {
      code = '#008000';
    } else if (n >= 80 && n <= 99) {
      code = '#FFFF00';
    }
    return code;
  }

  getBmiColor(n: any) {
    let code: string = '#FF0000'; // red
    if (n < 18.5) {
      code = '#FFA500';
    } else if (n >= 18.5 && n <= 22.9) {
      code = '#008000';
    } else if (n >= 23 && n <= 24.9) {
      code = '#FFFF00';
    } else if (n >= 25 && n <= 29.9) {
      code = '#F85E5EE6';
    } else if (n >= 30) {
      code = '#FF0000'
    }
    return code;
  }

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
              if (displayObs.match("SYSTOLIC") !== null) {
                this.answer.sbp = Number(
                  obs.display.slice(25, obs.display.length)
                );
              }
              if (displayObs.match("DIASTOLIC") !== null) {
                this.answer.dbp = Number(
                  obs.display.slice(26, obs.display.length)
                );
              }
              if (displayObs.match("Weight") !== null) {
                this.answer.weight = Number(
                  obs.display.slice(13, obs.display.length)
                );
              }
              if (displayObs.includes("Height")) {
                this.answer.heightCm = obs.display.slice(13, obs.display.length);
                this.answer.height = this.toFeet(this.answer.heightCm);
              }
              if (displayObs.match("BLOOD OXYGEN SATURATION") !== null) {
                this.answer.sp02 = Number(
                  obs.display.slice(25, obs.display.length)
                );
              }
              if (displayObs.match("TEMP") !== null) {
                this.answer.temp = Number(
                  obs.display.slice(17, obs.display.length)
                );
              }
              if (displayObs.match("Pulse") !== null) {
                this.answer.pulse = Number(
                  obs.display.slice(7, obs.display.length)
                );
              }
              if (displayObs.match("Respiratory rate") !== null) {
                this.answer.respiratoryRate = Number(
                  obs.display.slice(18, obs.display.length)
                );
              }
              if (displayObs.includes("HGB")) {
                this.answer.hgb = obs.value;
              }
              if (displayObs.includes("Blood group")) {
                this.answer.group = obs.value;
              }
              if (displayObs.includes("sugar fasting")) {
                this.answer.sugarLevelFasting = obs.value;
              }
              if (displayObs.includes("sugar after meal")) {
                this.answer.sugarLevelAfterMeal = obs.value;
              }
              if (displayObs.includes("sugar random")) {
                this.answer.sugarLevelRandom = obs.value;
              }
              if (this.answer?.weight && this.answer?.heightCm) {
                this.answer.bmi = this.answer.weight / ((this.answer.heightCm / 100) * (this.answer.heightCm / 100))
                this.answer.bmiColorCode = this.getBmiColor(this.answer.bmi);
              }
            });
            this.v.push(this.answer);
          });
        }
      });
    });
  }
}
