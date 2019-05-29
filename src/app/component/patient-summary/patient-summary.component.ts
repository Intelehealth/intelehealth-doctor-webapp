import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrls: ['./patient-summary.component.css']
})
export class PatientSummaryComponent implements OnInit {
show = false;
signPresent = false;
text: string;
font: string;

constructor(private service: EncounterService,
            private snackbar: MatSnackBar,
            private route: ActivatedRoute,
            private router: Router) { }

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

  sign() {
    const myDate = new Date();
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.service.session()
    .subscribe(response => {
      this.service.provider(response.user.uuid)
      .subscribe(user => {
        const providerUuid = user.results[0].uuid;
        this.service.signRequest(providerUuid)
        .subscribe(res => {
          if (res.results.length) {
            this.signPresent = true;
            res.results.forEach(element => {
              if (element.attributeType.display === 'Text of sign') {
                this.text = element.value;
                console.log(this.text);
              } if (element.attributeType.display === 'Font of sign') {
                this.font = element.value;
                console.log(this.font);
              }
            });
            this.service.visitComplete(patientUuid)
              .subscribe(visit => {
                if (visit.results.length > 0) {
                  this.snackbar.open('Visit already Complete', null, {duration: 4000});
                } else {
                  const json = {
                    patient: patientUuid,
                    encounterType: 'bd1fbfaa-f5fb-4ebd-b75c-564506fc309e',
                    encounterProviders: [{
                      provider: providerUuid,
                      encounterRole: '73bbb069-9781-4afc-a9d1-54b6b2270e03'
                      }],
                    visit: visitUuid,
                    encounterDatetime: myDate
                  };
                  console.log(json);
                  this.service.postEncounter(json)
                  .subscribe(post => {
                    console.log(post);
                  });
                }
              });
          } else {
            if (window.confirm('Your signature is not setup! If you click "Ok" you would be redirected . Cancel will load this website ')) {
              this.router.navigateByUrl('/myAccount');
              }
          }
        });
      });
    });
  }
}

