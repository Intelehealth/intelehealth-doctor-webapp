import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails, visitTypes } from 'src/config/constant';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit {

  active: number = 1;
  completedVisits: any = [];
  prescriptionSent: any = [];
  loaded1: boolean = false;
  loaded2: boolean = false;
  specialization: string = '';
  prescriptionSentCount: number = 0;
  completedVisitsCount: number = 0;

  constructor(private pageTitleService: PageTitleService, private visitService: VisitService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Prescription", imgUrl: "assets/svgs/menu-treatment-circle.svg" });
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      }
    }
    // this.getVisits();
    this.getPrescriptionSentVisits();
    this.getCompletedVisits();
  }

  getCompletedVisits(page: number = 1) {
    if(page == 1) this.completedVisits = [];
    this.visitService.getEndedVisits(this.specialization, page).subscribe((cv: any) => {
      if (cv.success) {
        this.completedVisitsCount = cv.totalCount;
        let records = [];
        for (let i = 0; i < cv.data.length; i++) {
          let visit = cv.data[i];
          let vcenc = this.checkIfEncounterExists2(visit.encounters, visitTypes.VISIT_COMPLETE);
          let pesenc = this.checkIfEncounterExists2(visit.encounters, visitTypes.PATIENT_EXIT_SURVEY);
          visit.cheif_complaint = this.getCheifComplaint2(visit);
          visit.visit_created = this.getEncounterCreated2(visit, visitTypes.ADULTINITIAL);
          visit.prescription_sent = (vcenc) ? this.checkIfDateOldThanOneDay(vcenc.encounter_datetime.replace('Z','+0530')) : null;
          if (pesenc) {
            visit.visit_ended = this.checkIfDateOldThanOneDay(pesenc.encounter_datetime.replace('Z','+0530'));
          } else {
            visit.visit_ended = this.checkIfDateOldThanOneDay(visit.date_stopped.replace('Z','+0530'));
          }
          visit.person.age = this.calculateAge(visit.person.birthdate);
          records.push(visit);
        }
        this.completedVisits = this.completedVisits.concat(records);
        this.loaded1 = true;
      }
    });
  }

  getCompletedVisitsData(page: number) {
    this.getCompletedVisits(page);
  }

  getPrescriptionSentVisits(page: number = 1) {
    if(page == 1) this.prescriptionSent = [];
    this.visitService.getCompletedVisits(this.specialization, page).subscribe((ps: any) => {
      if (ps.success) {
        this.prescriptionSentCount = ps.totalCount;
        let records = [];
        for (let i = 0; i < ps.data.length; i++) {
          let visit = ps.data[i];
          let vcenc = this.checkIfEncounterExists2(visit.encounters, visitTypes.VISIT_COMPLETE);
          visit.cheif_complaint = this.getCheifComplaint2(visit);
          visit.visit_created = this.getEncounterCreated2(visit, visitTypes.ADULTINITIAL);
          visit.prescription_sent = (vcenc) ? this.checkIfDateOldThanOneDay(vcenc.encounter_datetime.replace('Z','+0530')) : null;
          visit.person.age = this.calculateAge(visit.person.birthdate);
          records.push(visit);
        }
        this.prescriptionSent = this.prescriptionSent.concat(records);
        this.loaded2 = true;
      }
    });
  }

  getPrescriptionSentVisitsData(page: number) {
    this.getPrescriptionSentVisits(page);
  }

  getEncounterCreated2(visit: any, encounterName: string) {
    let created_at = '';
    const encounters = visit.encounters;
    encounters.forEach((encounter: any) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        created_at = this.getCreatedAt(encounter.encounter_datetime.replace('Z','+0530'));
      }
    });
    return created_at;
  }

  getCreatedAt(data: any) {
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

  getCheifComplaint2(visit: any) {
    let recent: any = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.concept_id == 163212) {
            const currentComplaint = this.visitService.getData2(currentObs)?.value_text.replace(new RegExp('►', 'g'),'').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  calculateAge(birthdate: any) {
    return moment().diff(birthdate,'years');
  }

  getVisits() {
    this.visitService.getVisits({ includeInactive: true }).subscribe((res: any) =>{
      if (res) {
        res.results.forEach((visit: any) => {
          let vcenc = this.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
          let pesenc = this.checkIfEncounterExists(visit.encounters, visitTypes.PATIENT_EXIT_SURVEY);

          if (visit.stopDateTime) {
            if (vcenc) visit.prescription_sent = this.checkIfDateOldThanOneDay(vcenc.encounterDatetime);
            if (pesenc) visit.visit_ended = this.checkIfDateOldThanOneDay(pesenc.encounterDatetime);
            if (!pesenc) visit.visit_ended = this.checkIfDateOldThanOneDay(visit.stopDatetime);
            visit.cheif_complaint = this.getCheifComplaint(visit);
            this.completedVisits.push(visit);
          } else {
            if (vcenc && pesenc) {
              visit.prescription_sent = this.checkIfDateOldThanOneDay(vcenc.encounterDatetime);
              visit.visit_ended = this.checkIfDateOldThanOneDay(pesenc.encounterDatetime);
              visit.cheif_complaint = this.getCheifComplaint(visit);
              this.completedVisits.push(visit);
            } else if (vcenc && !pesenc) {
              if (vcenc) visit.prescription_sent = this.checkIfDateOldThanOneDay(vcenc.encounterDatetime);
              visit.cheif_complaint = this.getCheifComplaint(visit);
              this.prescriptionSent.push(visit);
            }
          }


          // let flag = 0;
          // visit.encounters.forEach((encounter: any) => {
          //   if (encounter.encounterType.display == 'Patient Exit Survey') {
          //     visit.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
          //     visit.cheif_complaint = this.getCheifComplaint(visit);
          //     this.completedVisits.push(visit);
          //     flag = 1;
          //   }
          // });
          // if (flag == 0) {
          //   visit.encounters.forEach((encounter: any) => {
          //     if (encounter.encounterType.display == 'Visit Complete') {
          //       visit.prescription_sent = this.checkIfDateOldThanOneDay(encounter.encounterDatetime);
          //       visit.cheif_complaint = this.getCheifComplaint(visit);
          //       this.prescriptionSent.push(visit);
          //     }
          //   });
          // }
        });
        this.loaded1 = true;
      }
    }, (error: any) =>{
      this.loaded1= true;
    });
  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm A');
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
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.display.match(visitTypes.CURRENT_COMPLAINT) !== null) {
            const currentComplaint = this.visitService.getData(currentObs)?.value.replace(new RegExp('►', 'g'),'').split('<b>');
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split('<');
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
          }
        });
      }
    });
    return recent;
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  checkIfEncounterExists2(encounters: any, visitType: string) {
    return encounters.find((enc: any) => enc.type.name == visitType);
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

}
