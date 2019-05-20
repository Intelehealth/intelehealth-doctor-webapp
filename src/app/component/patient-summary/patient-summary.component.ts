import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrls: ['./patient-summary.component.css']
})
export class PatientSummaryComponent implements OnInit {
show = false;

constructor(private service: EncounterService,
              private route: ActivatedRoute) { }

  ngOnInit() {
  }

  onClick() {
    const myDate = new Date();
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.service.visitNote(patientUuid)
    .subscribe(visitNote => {
      if (visitNote.results.length === 0) {
        this.service.session()
        .subscribe(session => {
          const userUuid = session.user.uuid;
          this.service.provider(userUuid)
          .subscribe(provider => {
            const providerUuid = provider.results[0].uuid;
            const json = {
              patient: patientUuid,
              encounterType: 'd7151f82-c1f3-4152-a605-2f9ea7414a79',
              encounterProviders: [{
                provider: providerUuid,
                encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03'
              }],
              visit: visitUuid,
              encounterDatetime: myDate
            };
            this.service.postEncounter(json)
            .subscribe(response => {
              console.log(response);
            });
          });
        });
      }
    });
    this.show = true;
  }
}

