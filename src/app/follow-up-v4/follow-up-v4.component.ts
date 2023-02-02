import { DatePipe } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as moment from "moment";
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
  selecteDate;selectedTime;
  selecteAdvice:string;
  isDataPresent:boolean=false;
  timeList = [];
  followUpData = [
    "Do you want to have follow up with the patient",
    "Select date",
    "Select time",
    "Reason for follow-up",
  ];

  constructor(private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute,
    private datepipe: DatePipe) {}

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.timeList= this.getHours();
    this.diagnosisService.getObs(this.patientId, this.conceptFollow)
    .subscribe(response => {
      response.results.forEach(obs => {
        if (obs.encounter.visit.uuid === this.visitUuid || this.readOnly === true) {
          let date1 = obs.value.split(", Time: ")[0].replaceAll('-','/');
           let selecteDate = moment(date1,'DD/MM/YYYY').toISOString();
          this.selecteDate = this.datepipe.transform(selecteDate, 'yyyy-MM-dd');
          this.selectedTime = obs.value.split(", Time: ")[1].split(", Remark: ")[0];
          this.selecteAdvice = obs.value.split(", Time: ")[1].split(", Remark: ")[1];
          this.isDataPresent = true;
          this.type = "Y";
        }
      });
    });
  }

  getHours(returnAll = true, date?) {
    const hours = Array.from(
      {
        length:21,
      },
      (_, hour) =>
        moment({
          hour,
          minutes: 0,
        }).format("LT")
    );
   hours.splice(0, 9);
    if (this.isToday(date) && !returnAll) {
      const hrs = hours.filter((h) => moment(h, "LT").isAfter(moment()));
      return hrs;
    } else {
      return hours;
    }
  }

  isToday(date) {
    const start = moment().startOf("day");
    const end = moment().endOf("day");
    return (
      moment().startOf("day").isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
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
        value: this.selecteAdvice ? `${obsdate}, Time: ${this.selectedTime}, Remark: ${this.selecteAdvice}` : obsdate,
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
