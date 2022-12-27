import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DiagnosisService } from "../services/diagnosis.service";
import { EncounterService } from "../services/encounter.service";
declare var getEncounterUUID: any;

@Component({
  selector: "app-notes-v4",
  templateUrl: "./notes-v4.component.html",
  styleUrls: ["./notes-v4.component.scss"],
})
export class NotesV4Component implements OnInit {
  @Input() iconImg = "assets/svgs/note-icon.svg";
  @Input() readOnly = false;
  @Input() showToggle = true;

  showAddMore = false;
  isCollapsed = false;
  conceptNote = '162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  patientId: string;
  visitUuid: string;
  noteData = [];
  noteValue: string;

  constructor(private service: EncounterService,
    private diagnosisService: DiagnosisService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.diagnosisService.getObs(this.patientId, this.conceptNote)
      .subscribe(response => {
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            this.noteData.push(obs);
          }
        });
      });
  }
  
  submit() {
    const date = new Date();
    if (this.diagnosisService.isSameDoctor() && this.noteValue?.trim()) {
      let encounterUuid = getEncounterUUID();
      const json = {
        concept: this.conceptNote,
        person: this.patientId,
        obsDatetime: date,
        value: this.noteValue,
        encounter: encounterUuid
      };
      this.service.postObs(json)
        .subscribe(resp => {
          this.noteData.push({ uuid: resp.uuid, value: this.noteValue });
          this.noteValue = '';
        });
    }
  }
  
  delete(i: number) {
    if (this.diagnosisService.isSameDoctor()) {
      const uuid = this.noteData[i].uuid;
      this.diagnosisService.deleteObs(uuid)
        .subscribe(() => {
          this.noteData.splice(i, 1);
        });
    }
  }
}
