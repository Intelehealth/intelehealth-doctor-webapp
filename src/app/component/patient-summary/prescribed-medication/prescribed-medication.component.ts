import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-prescribed-medication',
  templateUrl: './prescribed-medication.component.html',
  styleUrls: ['./prescribed-medication.component.css']
})
export class PrescribedMedicationComponent implements OnInit {
meds: any = [];

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
          if (display.match('JSV MEDICATIONS') != null) {
            const msg = display.slice(16, display.length);
            this.meds.push(msg);
          }
        });
      });
    });
  }

}
