import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';

@Component({
  selector: 'app-vital',
  templateUrl: './vital.component.html',
  styleUrls: ['./vital.component.css']
})
export class VitalComponent implements OnInit {
answer: any = [];
v: any = [];
vitalsPresent = false;
  constructor(private route: ActivatedRoute,
    private service: EncounterService) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.service.recentVitals(uuid)
    .subscribe(response => {
      const encounters = response.results;
      encounters.forEach(element => {
        const display = element.display;
        if (display.match('Vitals') !== null ) {
          this.vitalsPresent = true;
          const date = display.split(' ');
          this.answer.date = date[1];
          const vitalUUID = element.uuid;
          this.service.vitals(vitalUUID)
          .subscribe(vitals => {
            const vital = vitals.obs;
            vital.forEach(obs => {
              const displayObs = obs.display;
              if (displayObs.match('SYSTOLIC') !== null ) {
                this.answer.sbp = Number(obs.display.slice(25, obs.display.length));
              }
              if (displayObs.match('DIASTOLIC') !== null ) {
                this.answer.dbp = Number(obs.display.slice(26, obs.display.length));
              }
              if (displayObs.match('Weight') !== null ) {
                this.answer.weight = Number(obs.display.slice(13, obs.display.length));
              }
              if (displayObs.match('Height') !== null ) {
                this.answer.height = Number(obs.display.slice(13, obs.display.length));
              }
              if (displayObs.match('BLOOD OXYGEN SATURATION') !== null ) {
                this.answer.sp02 = Number(obs.display.slice(25, obs.display.length));
              }
              if (displayObs.match('TEMP') !== null ) {
                this.answer.temp = Number(obs.display.slice(17, obs.display.length));
              }
              if (displayObs.match('Pulse') !== null ) {
                this.answer.pulse = Number(obs.display.slice(7, obs.display.length));
              }
            });
            this.v.push(this.answer);
          });
        }
      });
      });
}
}
