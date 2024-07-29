import { Component, OnInit } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute } from "@angular/router";
import { UntypedFormGroup, UntypedFormControl, Validators } from "@angular/forms";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { DatePipe } from "@angular/common";
import {
  transition,
  trigger,
  style,
  animate,
  keyframes,
} from "@angular/animations";
declare var getFromStorage: any,
  getEncounterUUID: any;

@Component({
  selector: "app-follow-up",
  templateUrl: "./follow-up.component.html",
  styleUrls: ["./follow-up.component.css"],
  animations: [
    trigger("moveInLeft", [
      transition("void=> *", [
        style({ transform: "translateX(300px)" }),
        animate(
          200,
          keyframes([
            style({ transform: "translateX(300px)" }),
            style({ transform: "translateX(0)" }),
          ])
        ),
      ]),
      transition("*=>void", [
        style({ transform: "translateX(0px)" }),
        animate(
          100,
          keyframes([
            style({ transform: "translateX(0px)" }),
            style({ transform: "translateX(300px)" }),
          ])
        ),
      ]),
    ]),
  ],
})
export class FollowUpComponent implements OnInit {
  minDate = new Date();
  followUp: any = [];
  conceptFollow = "e8caffd6-5d22-41c4-8d6a-bc31a44d0c86";
  encounterUuid: string;
  patientId: string;
  visitUuid: string;
  errorText: string;

  followForm = new UntypedFormGroup({
    date: new UntypedFormControl("", [Validators.required]),
    advice: new UntypedFormControl(""),
  });

  constructor(
    private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private datepipe: DatePipe
  ) { }

  ngOnInit() {
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    let visitNoteProvider = getFromStorage('visitNoteProvider');
    const obsData = visitNoteProvider.obs.filter(a=> a.display.match("Follow up visit"));
    obsData.forEach(obs=> {
      this.followUp.push({uuid: obs.uuid, value :obs.value});
    })
  }

  Submit() {
    const date = new Date();
    const form = this.followForm.value;
    const obsdate = this.datepipe.transform(form.date, "dd-MM-yyyy");
    const advice = form.advice;
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    if (this.diagnosisService.isSameDoctor()) {
      this.encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptFollow,
        person: this.patientId,
        obsDatetime: date,
        value: advice ? `${obsdate}, Remark: ${advice}` : obsdate,
        encounter: this.encounterUuid,
      };
      this.service.postObs(json).subscribe((resp) => {
      //  this.diagnosisService.isVisitSummaryChanged = true;
        this.followUp.push({ uuid: resp.uuid, value: json.value });
      });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.followUp[i].uuid;
      this.diagnosisService.deleteObs(uuid).subscribe((res) => {
        this.followUp.splice(i, 1);
      });
    }
  }
}
