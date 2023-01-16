import { VisitService } from 'src/app/services/visit.service';
import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncounterService } from 'src/app/services/encounter.service';

@Component({
  selector: "app-vitals-v4",
  templateUrl: "./vitals-v4.component.html",
  styleUrls: ["./vitals-v4.component.scss"],
})
export class VitalsV4Component implements OnInit {
  @Input() pastVisit = false;
  answer: any = [];
  vitalsData: any = [];
  vitalsPresent = false;
  changeSide:boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private service: EncounterService
  ) {}

  ngOnInit(): void {
    const visitUuid = this.route.snapshot.paramMap.get('visit_id');    
      this.visitService.fetchVisitDetails(visitUuid)
      .subscribe(visits => {        
        visits.encounters.forEach(visit => {
          const display = visit.display;
          if (visit.display.match('Vitals') !== null ) {
            this.vitalsPresent = true;
            this.answer.date = display.split(' ')[1];
            const vitalUUID = visit.uuid;
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
                if (displayObs.match('Respiratory rate') !== null ) {
                  this.answer.respiratoryRate = Number(obs.display.slice(18, obs.display.length));
                }
              });
              this.vitalsData.push(this.answer);
            });
          }
        });
      });
  }

  toggleCollapse(){
    this.changeSide = !this.changeSide;
  }
  get toggleImage() {
    return `assets/svgs/${
      this.changeSide ? "filter-table-up-arrow.svg" : "filter-table-down-arrow.svg"
    }`;
  }
}
