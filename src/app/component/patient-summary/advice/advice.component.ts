import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';

@Component({
  selector: 'app-advice',
  templateUrl: './advice.component.html',
  styleUrls: ['./advice.component.css']
})
export class AdviceComponent implements OnInit {
advice: any = [];

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
          if (display.match('MEDICAL ADVICE') != null) {
            const msg = display.slice(16, display.length);
            this.advice.push(msg);
          }
        });
      });
    });
  }

}
