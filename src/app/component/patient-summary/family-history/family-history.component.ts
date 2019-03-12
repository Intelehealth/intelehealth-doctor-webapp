import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';


@Component({
  selector: 'app-family-history',
  templateUrl: './family-history.component.html',
  styleUrls: ['./family-history.component.css']
})
export class FamilyHistoryComponent implements OnInit {
encounter: any = [];
result: any = [];
familyHistory: any = [];

  constructor(private service: EncounterService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('patient_id');
    this.service.adultInitial(uuid)
    .subscribe(response => {
      this.result = response;
      const encounterUuid = this.result.results[0].uuid;
      this.service.vitals(encounterUuid)
      .subscribe(response1 => {
        const obs = response1.obs;
        obs.forEach(element => {
          const display = element.display;
          if (display.match('FAMILY HISTORY') != null) {
             this.familyHistory = display.substring(16);
          }
        });
      });
    });
  }
}
