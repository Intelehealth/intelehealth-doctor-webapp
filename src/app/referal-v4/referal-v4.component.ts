import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";
import { EncounterService } from "../services/encounter.service";
declare var getEncounterUUID: any;

@Component({
  selector: "app-referal-v4",
  templateUrl: "./referal-v4.component.html",
  styleUrls: ["./referal-v4.component.scss"],
})
export class ReferalV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/referal.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  showAddMore = false;
  isCollapsed = false;
  patientId: string;
  visitUuid: string
  conceptReferral = "605b6f15-8f7a-4c45-b06d-14165f6974be";
  referal:string;
  remark:string;
  referalList = [
    "General Physician",
    "Dermatologist",
    "Physiotherapist",
    "Gynecologist",
    "Pediatrician"  
  ];
  headers = [
    {
      name: "Referral facility",
      type: "string",
      key: "referal",
      thClass: "referal-table",
    },
    { name: "Remarks", type: "remark", key: "remark" },
  ];

  referralData = [];

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptReferral)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.referralData.push(this.getObj(obs));
          }
          this.referralData.push(this.getObj(obs));
        });
      });
      this.referal = this.referalList[0];
  }

  submit() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor() && this.referal) {
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptReferral,
        person: this.patientId,
        obsDatetime: date,
        value: `${this.referal}:${this.remark}`,
        encounter: encounterUuid
      };
      this.service.postObs(json)
        .subscribe(resp => {
          this.referralData.push({ uuid: resp.uuid, referal: this.referal, remark: this.remark});
          this.referal = this.referalList[0];
          this.remark = '';
        });
    }
  }
  
  delete(i: number) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.referralData[i].uuid;
      this.diagnosisService.deleteObs(uuid)
        .subscribe(() => {
          this.referralData.splice(i, 1);
        });
    }
  }

  getObj(obs) {
   let value = obs?.value?.split(":");
   let obj = {
     uuid : obs.uuid,
     referal : value[0],
     remark : value[1]
   }
   return obj;
  }
}
