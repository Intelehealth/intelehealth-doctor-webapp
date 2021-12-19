import { Component, OnInit } from '@angular/core';
import { transition, trigger, style, animate, keyframes } from '@angular/animations';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { EncounterService } from 'src/app/services/encounter.service';
declare var getEncounterProviderUUID: any, getFromStorage: any, getEncounterUUID: any;

@Component({
  selector: 'app-update-status',
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.css'],
  animations: [
    trigger('moveInLeft', [
      transition('void=> *', [style({ transform: 'translateX(300px)' }),
      animate(200, keyframes([
        style({ transform: 'translateX(300px)' }),
        style({ transform: 'translateX(0)' })
      ]))]),
      transition('*=>void', [style({ transform: 'translateX(0px)' }),
      animate(100, keyframes([
        style({ transform: 'translateX(0px)' }),
        style({ transform: 'translateX(300px)' })
      ]))])
    ])
  ]
})
export class UpdateStatusComponent implements OnInit {
  coOrdinatorConcept = 'cd4a9afb-3168-439e-88b4-99278548748c';
  minDate = new Date();
  encounterUuid: string;
  patientId: string;
  visitUuid: string;

  coordinatorStatus = new FormGroup({
    date: new FormControl(new Date(), [Validators.required]),
    status: new FormControl('')
  });

  constructor(private service: EncounterService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.patientId = this.route.snapshot.params['patient_id'];
    this.encounterUuid = getEncounterUUID();
  }

  Submit() {
    const date = new Date();
    const form = this.coordinatorStatus.value;
    const status = form.status;
    const json = {
      concept: this.coOrdinatorConcept,
      person: this.patientId,
      obsDatetime: date,
      value: status,
      encounter: this.encounterUuid
    };
    this.service.postObs(json)
    .subscribe(resp => {
      console.log(resp)
      // this.followUp.push({ uuid: resp.uuid, value: json.value });
    });
  }

}
