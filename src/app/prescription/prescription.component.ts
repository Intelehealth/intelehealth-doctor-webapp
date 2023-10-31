import { Component, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { ApiResponseModel, CustomEncounterModel, CustomVisitModel, ProviderAttributeModel } from '../model/model';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit {

  active: number = 1;
  completedVisits: CustomVisitModel[] = [];
  prescriptionSent: CustomVisitModel[] = [];
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
    this.getPrescriptionSentVisits();
    this.getCompletedVisits();
  }

  getCompletedVisits(page: number = 1) {
    if(page == 1) this.completedVisits = [];
    this.visitService.getEndedVisits(this.specialization, page).subscribe((cv: ApiResponseModel) => {
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
    this.visitService.getCompletedVisits(this.specialization, page).subscribe((ps: ApiResponseModel) => {
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

  getEncounterCreated2(visit: CustomVisitModel, encounterName: string) {
    let created_at = '';
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        created_at = this.getCreatedAt(encounter.encounter_datetime.replace('Z','+0530'));
      }
    });
    return created_at;
  }

  getCreatedAt(data: string) {
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

  getCheifComplaint2(visit: CustomVisitModel) {
    let recent: string[] = [];
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

  calculateAge(birthdate: string) {
    return moment().diff(birthdate,'years');
  }

  checkIfDateOldThanOneDay(data: string) {
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

  checkIfEncounterExists2(encounters: CustomEncounterModel[], visitType: string) {
    return encounters.find((enc: CustomEncounterModel) => enc.type.name == visitType);
  }

  getSpecialization(attr: ProviderAttributeModel[]) {
    let specialization = '';
    attr.forEach((a: ProviderAttributeModel) => {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

}
