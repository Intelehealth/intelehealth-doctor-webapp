import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { debounceTime, distinctUntilChanged, map } from "rxjs/operators";
import { DiagnosisService } from "../services/diagnosis.service";
import { EncounterService } from "../services/encounter.service";
declare var getEncounterUUID: any;

@Component({
  selector: "app-advice-v4",
  templateUrl: "./advice-v4.component.html",
  styleUrls: ["./advice-v4.component.scss"],
})
export class AdviceV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/advice.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  showAddMore = false;
  isCollapsed = false;
  conceptAdvice = '67a050c1-35e5-451c-a4ab-fff9d57b0db1';
  visitUuid: string;
  patientId: string;
  adviceData = [];
  advices = [];
  newAdvice:string;

  constructor(private encounterService: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) {}

    search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.advices.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10))
    )
  ngOnInit(): void {
    const adviceUuid = '0308000d-77a2-46e0-a6fa-a8c1dcbc3141';
    this.diagnosisService.concept(adviceUuid)
      .subscribe(res => {
        const result = res.answers;
        result.forEach(ans => {
          this.advices.push(ans.display);
        });
      });
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptAdvice)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visitUuid || this.readOnly === true) {
            if (!obs.value.includes('</a>')) {
              this.adviceData.push(obs);
            }
          }
        });
      });
  }

  submit() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor() && this.newAdvice?.trim()) {
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptAdvice,
        person: this.patientId,
        obsDatetime: date,
        value: this.newAdvice,
        encounter: encounterUuid
      };
      this.encounterService.postObs(json)
        .subscribe(response => {
          this.adviceData.push({ uuid: response.uuid, value: this.newAdvice });
          this.newAdvice = '';
        });
    }
  }

  delete(i) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.adviceData[i].uuid;
      this.diagnosisService.deleteObs(uuid)
        .subscribe(() => {
          this.adviceData.splice(i, 1);
        });
    }    
  }
}
