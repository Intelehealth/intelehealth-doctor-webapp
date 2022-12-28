import { Component, OnInit } from '@angular/core';
import { VisitService } from 'src/app/services/visit.service';
import * as moment from 'moment';

@Component({
  selector: 'app-prescription-container',
  templateUrl: './prescription-container.component.html',
  styleUrls: ['./prescription-container.component.scss']
})
export class PrescriptionContainerComponent implements OnInit {

  activeTab: string = 'sent';
  completedVisits: any = [];
  prescriptionSent: any = [];
  isLoaded: boolean = false;

  constructor(private visitService: VisitService) { }

  ngOnInit(): void {
    this.getVisits();
  }

  getVisits() {
    this.visitService.getVisits({ includeInactive: true }).subscribe((res: any) =>{
      if (res) {
        res.results.forEach((visit: any) => {
          let flag = 0;
          visit.encounters.forEach((encounter: any) => {
            if (encounter.encounterType.display == 'Patient Exit Survey') {
              visit.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
              visit.cheif_complaint = this.getCheifComplaint(visit);
              this.completedVisits.push(visit);
              flag = 1;
            }
          });
          if (flag == 0) {
            visit.encounters.forEach((encounter: any) => {
              if (encounter.encounterType.display == 'Visit Complete') {
                visit.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                visit.cheif_complaint = this.getCheifComplaint(visit);
                this.prescriptionSent.push(visit);
              }
            });
          }
        });
      }
      this.isLoaded = true;
    });
  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    };
    if (hours < 1) {
      return `${minutes} minutes ago`;
    }
    return `${hours} hrs ago`;
  }

  getCheifComplaint(visit: any) {
    let recent: any = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.display;
      if (display.match('ADULTINITIAL') !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.display.match('CURRENT COMPLAINT') !== null) {
            const currentComplaint = currentObs.display.split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match('Associated symptoms')) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

}
