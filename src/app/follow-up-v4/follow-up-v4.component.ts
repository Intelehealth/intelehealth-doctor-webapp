import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";
import { EncounterService } from "../services/encounter.service";
declare var getEncounterUUID: any;

@Component({
  selector: "app-follow-up-v4",
  templateUrl: "./follow-up-v4.component.html",
  styleUrls: ["./follow-up-v4.component.scss"],
})
export class FollowUpV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/follow-up.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;
  minDate =  this.datepipe.transform(new Date(), 'yyyy-MM-dd');
  type = "N";
  isCollapsed = false;
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
  patientId: string;
  visitUuid: string;
  followUp = [];
  selecteDate:Date;
  selecteAdvice:string;
  isDataPresent:boolean=false;
  followUpData = [
    "Do you want to have follow up with the patient",
    "Select date",
    "Reason for follow-up",
  ];

  constructor(private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private datepipe: DatePipe) {}

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptFollow)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid) {
          this.selecteDate = obs.value.split(", Remark: ")[0];
          this.selecteAdvice = obs.value.split(", Remark: ")[1];
          this.isDataPresent = true;
        }
      });
    });
  }

  submit() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor() && this.selecteDate) {
      const obsdate = this.datepipe.transform(this.selecteDate, 'dd-MM-yyyy');
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptFollow,
        person: this.patientId,
        obsDatetime: date,
        value: this.selecteAdvice ? `${obsdate}, Remark: ${this.selecteAdvice}` : obsdate,
        encounter: encounterUuid
      };
      this.encounterService.postObs(json)
      .subscribe(resp => {
        this.followUp.push({uuid: resp.uuid, value: json.value});
        this.isDataPresent = true;
      });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.followUp[i].uuid;
      this.diagnosisService.deleteObs(uuid)
      .subscribe(() => {
        this.followUp.splice(i, 1);
      });
    } 
  }
}
