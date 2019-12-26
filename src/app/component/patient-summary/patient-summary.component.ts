import { VisitService } from './../../services/visit.service';
import { Component, OnInit } from '@angular/core';
import { EncounterService } from 'src/app/services/encounter.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-summary',
  templateUrl: './patient-summary.component.html',
  styleUrls: ['./patient-summary.component.css']
})
export class PatientSummaryComponent implements OnInit {
userSubscription: Subscription;
show = false;
text: string;
font: string;
visitNotePresent = false;
visitCompletePresent = false;
setSpiner = true;
constructor(private service: EncounterService,
            private visitService: VisitService,
            private snackbar: MatSnackBar,
            private route: ActivatedRoute,
            private router: Router) {
              this.router.routeReuseStrategy.shouldReuseRoute = function() {
                return false;
            };
            }

  ngOnInit() {
    setTimeout(() => {this.setSpiner = false; }, 1000);
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
    this.visitService.fetchVisitDetails(visitUuid)
    .subscribe(visitDetails => {
      visitDetails.encounters.forEach(visit => {
        if (visit.display.match('Visit Note') !== null) {
          this.visitNotePresent = true;
          this.show = true;
        }
        if (visit.display.match('Visit Complete') !== null) {
          this.visitCompletePresent = true;
          this.service.session()
          .subscribe(response => {
            this.service.provider(response.user.uuid)
            .subscribe(user => {
              const providerUuid = user.results[0].uuid;
              this.service.signRequest(providerUuid)
              .subscribe(res => {
                if (res.results.length) {
                  res.results.forEach(element => {
                    if (element.attributeType.display === 'textOfSign') {
                      this.text = element.value;
                    } if (element.attributeType.display === 'fontOfSign') {
                      this.font = element.value;
                    }
                  });
                }
              });
            });
          });
        }
      });
    });
  }

  onStartVisit() {
    const myDate = new Date();
    const patientUuid = this.route.snapshot.paramMap.get('patient_id');
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');
      if (!this.visitNotePresent) {
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
              if (response) {
                this.show = true;
                this.snackbar.open(`Visit Note Created`, null, {
                  duration: 4000
                });
              } else {
                this.snackbar.open(`Visit Note Not Created`, null, {duration: 4000});
              }
            });
          });
        });
      }
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
            res.results.forEach(element => {
              if (element.attributeType.display === 'textOfSign') {
                this.text = element.value;
              } if (element.attributeType.display === 'fontOfSign') {
                this.font = element.value;
              }
            });
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
            this.service.postEncounter(json)
            .subscribe(post => {
              this.visitCompletePresent = true;
              this.snackbar.open('Visit Complete', null, {duration: 4000});
            });
          } else {
            if (window.confirm('Your signature is not setup! If you click "Ok" you would be redirected. Cancel will load this website ')) {
              this.router.navigateByUrl('/myAccount');
            }
          }
        });
      });
    });
  }

}

