import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-diagnosis',
  templateUrl: './diagnosis.component.html',
  styleUrls: ['./diagnosis.component.css']
})
export class DiagnosisComponent implements OnInit {
diagnosis: any = [];

  constructor(private service: EncounterService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const patientId = this.route.snapshot.params['patient_id'];
    this.service.visitNote(patientId)
    .subscribe(response => {
      const encounterUuid = response.results[0].uuid;
      this.service.vitals(encounterUuid)
      .subscribe(res => {
        const obs = res.obs;
        obs.forEach(observation => {
          const display = observation.display;
          if (display.match('TELEMEDICINE DIAGNOSIS') != null) {
            const msg = display.slice(24, display.length);
            this.diagnosis.push(msg);
          }
        });
      });
    });
  }

}
