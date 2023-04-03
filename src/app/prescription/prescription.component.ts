import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit {

  active: number = 1;
  completedVisits: any = [];
  prescriptionSent: any = [];
  loaded: boolean = false;
  specialization: string = '';
  hospitalType: string = '';

  constructor(private pageTitleService: PageTitleService, private visitService: VisitService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Prescription", imgUrl: "assets/svgs/menu-treatment-circle.svg" });
    let provider = JSON.parse(localStorage.getItem('provider'));
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
        this.hospitalType = this.getHospitalType(provider.attributes);
        this.getVisits();
      }
    }
  }

  getVisits() {
    this.visitService.getVisits({ includeInactive: true }).subscribe((res: any) =>{
      if (res) {
        res.results.forEach((visit: any) => {
          if (visit.encounters.length > 0) {
            if (visit.attributes.length) {
              const visitSpeciality   =  visit.attributes.find((attr: any) => attr.attributeType.uuid == "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d");
              const visitHospitalType =  visit.attributes.find((attr: any) => attr.attributeType.uuid == "f288fc8f-428a-4665-a1bd-7b08e64d66e1");
              if (visitSpeciality && visitHospitalType) {
                // If specialization and hospital type matches process visit
                if (visitSpeciality.value == this.specialization && visitHospitalType.value == this.hospitalType) {
                  let flag = 0;
                  visit.encounters.forEach((encounter: any) => {
                    if (encounter.encounterType.display == 'Patient Exit Survey' || encounter.encounterType.display == 'Visit Complete') {
                      visit.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                      visit.cheif_complaint = this.getCheifComplaint(visit);
                      this.completedVisits.push(visit);
                      flag = 1;
                    }
                  });
                  if (flag == 0) {
                    visit.encounters.forEach((encounter: any) => {
                      if (encounter.encounterType.display == 'Remote Prescription') {
                        visit.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
                        visit.cheif_complaint = this.getCheifComplaint(visit);
                        this.prescriptionSent.push(visit);
                      }
                    });
                  }
                }
              }

            }
          }
        });
        this.loaded = true;
      }
    }, (error: any) =>{
      this.loaded = true;
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

  getSpecialization(attr: any) {
    let specialization = '';
    attr.forEach((a: any) => {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

  getHospitalType(attr: any) {
    let specialization = '';
    attr.forEach((a: any) => {
      if (a.attributeType.uuid == 'bdb290d6-97e8-45df-83e6-cadcaf5dcd0f' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

}
