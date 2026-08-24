import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageTitleService } from '../core/page-title/page-title.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { getCacheData, getAge } from '../utils/utility-functions';
import { doctorDetails, visitTypes } from 'src/config/constant';
import { ApiResponseModel, CustomEncounterModel, CustomVisitModel, ProviderAttributeModel } from '../model/model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.scss']
})
export class PrescriptionComponent implements OnInit , OnDestroy{

  active: number = 1;
  completedVisits: CustomVisitModel[] = [];
  prescriptionSent: CustomVisitModel[] = [];
  referredVisits: CustomVisitModel[] = [];
  loaded1: boolean = false;
  loaded2: boolean = false;
  loaded3: boolean = false;
  specialization: string = '';
  prescriptionSentCount: number = 0;
  completedVisitsCount: number = 0;
  referredVisitsCount: number = 0;
  allPrescriptionSent: any[] = [];
  allCompletedVisits: any[] = [];
  allReferredVisits: any[] = [];
  searchTermComp: string = '';
  searchTerm: string = '';
  searchTermRef: string = '';
  private sentSearch$ = new Subject<string>();
  private completedSearch$ = new Subject<string>();
  private referredSearch$ = new Subject<string>();
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
    this.getReferredVisits();

     // Prescription Sent search debounce
    this.sentSearch$
     .pipe(
       debounceTime(400),
       distinctUntilChanged()
     )
     .subscribe(term => {
       this.searchTerm = term;
       this.getPrescriptionSentVisits(1); // page reset
     });

    // Completed Visits search debounce
    this.completedSearch$
     .pipe(
       debounceTime(400),
       distinctUntilChanged()
      )
     .subscribe(term => {
       this.searchTerm = term;
       this.getCompletedVisits(1); // page reset
      });

    // Referred Visits search debounce
    this.referredSearch$
     .pipe(
       debounceTime(400),
       distinctUntilChanged()
      )
     .subscribe(term => {
       this.searchTermRef = term;
       this.getReferredVisits(1); // page reset
      });
  }

  /**
  * Get completed visits for a given page number
  * @param {number} page - Page number
  * @param {string} searchTerm - Optional search term
  * @return {void}
  */

  getCompletedVisits(page: number = 1) {
    if(page == 1) this.completedVisits = []; this.allCompletedVisits = []; 
    this.visitService.getEndedVisits(this.specialization, page).subscribe((cv: ApiResponseModel) => {
      if (cv.success) {
        this.completedVisitsCount = cv.totalCount;
        let records = [];
        for (let i = 0; i < cv.data.length; i++) {
          let visit = cv.data[i];
          let vcenc = this.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
          let pesenc = this.checkIfEncounterExists(visit.encounters, visitTypes.PATIENT_EXIT_SURVEY);
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.prescription_sent = (vcenc) ? this.checkIfDateOldThanOneDay(vcenc.encounter_datetime.replace('Z','+0530')) : null;
          if (pesenc) {
            visit.visit_ended = this.checkIfDateOldThanOneDay(pesenc.encounter_datetime.replace('Z','+0530'));
          } else {
            visit.visit_ended = this.checkIfDateOldThanOneDay(visit.date_stopped.replace('Z','+0530'));
          }
          visit.person.age = this.calculateAge(visit.person.birthdate);
          records.push(visit);
        }
        // For server-side pagination, replace data instead of concatenating
          // master list append
      this.allCompletedVisits = [...this.allCompletedVisits, ...records];
      // 🔍 derive UI list
      this.applyCompletedSearch();
        if(!this.loaded1) {
          this.loaded1 = true;
        }
      }
    });
  }

  applyCompletedSearch() {
  if (!this.searchTerm) {
    this.completedVisits = [...this.allCompletedVisits];
    return;
  }
  const term = this.searchTerm.toLowerCase().trim();
  this.completedVisits = this.allCompletedVisits.filter(visit => {
    const name = [
      visit.patient_name?.given_name,
      visit.patient_name?.middle_name,
      visit.patient_name?.family_name
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return name.includes(term);
  });
}


  /**
  * Get completed visits for a given page number and search term
  * @param {Object} params - Object containing page, pageSize, and optional searchTerm
  * @return {void}
  */
  getCompletedVisitsData(params: {page: number, pageSize: number, searchTerm: string}) {
     // Search → debounce
   if (params.searchTerm !== undefined) {
    this.completedSearch$.next(params.searchTerm);
    return;
  }
    this.getCompletedVisits(params.page);
  }

  /**
  * Get referred visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
  getReferredVisits(page: number = 1) {
    if(page == 1) this.referredVisits = []; this.allReferredVisits = [];
    this.visitService.getReferredVisits(this.specialization, page).subscribe((rv: ApiResponseModel) => {
      if (rv.success) {
        this.referredVisitsCount = rv.totalCount;
        let records = [];
        for (let i = 0; i < rv.data.length; i++) {
          let visit = rv.data[i];
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.status = this.getReferredVisitStatus(visit);
          visit.routing_specialization = this.getRoutingSpecialization(visit);
          visit.person.age = getAge(visit.person.birthdate, undefined, true);
          records.push(visit);
        }
        this.allReferredVisits = [...this.allReferredVisits, ...records];
        this.applyReferredSearch();
        if(!this.loaded3) {
          this.loaded3 = true;
        }
      }
    });
  }

  applyReferredSearch() {
    if (!this.searchTermRef) {
      this.referredVisits = [...this.allReferredVisits];
      return;
    }
    const term = this.searchTermRef.toLowerCase().trim();
    this.referredVisits = this.allReferredVisits.filter(visit => {
      const name = [
        visit.patient_name?.given_name,
        visit.patient_name?.middle_name,
        visit.patient_name?.family_name
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return name.includes(term);
    });
  }

  /**
  * Get referred visits for a given page number and search term
  * @param {Object} params - Object containing page, pageSize, and optional searchTerm
  * @return {void}
  */
  getReferredVisitsData(params: {page: number, pageSize: number, searchTerm?: string}) {
    if (params.searchTerm !== undefined) {
      this.referredSearch$.next(params.searchTerm);
      return;
    }
    this.getReferredVisits(params.page);
  }

  /**
  * status is "Referred".
  * @param {CustomVisitModel} _visit - Visit
  * @return {string} - Visit stage label
  */
  getReferredVisitStatus(_visit: CustomVisitModel): string {
    return 'Referred';
  }

  /**
  * Get the specialization a visit was referred/routed to
  * @param {CustomVisitModel} visit - Visit
  * @return {string} - Referred-to specialization, or empty string if not present
  */
  getRoutingSpecialization(visit: CustomVisitModel): string {
    const attr = (visit.attributes || []).find(
      (a: any) => a?.attribute_type?.name === visitTypes.ROUTING_SPECIALIZATION
    );
    return attr?.value_reference || '';
  }

  /**
  * Get prescriptions sent visits for a given page number
  * @param {number} page - Page number
  * @param {string} searchTerm - Optional search term
  * @param {string} searchTermComp - Optional search term
  * @return {void}
  */
  getPrescriptionSentVisits(page: number = 1) {
    if(page == 1) this.prescriptionSent = [];  this.allPrescriptionSent = []; //IMPORTANT;
    this.visitService.getCompletedVisits(this.specialization, page).subscribe((ps: ApiResponseModel) => {
      if (ps.success) {
        this.prescriptionSentCount = ps.totalCount;
        let records = [];
        for (let i = 0; i < ps.data.length; i++) {
          let visit = ps.data[i];
          let vcenc = this.checkIfEncounterExists(visit.encounters, visitTypes.VISIT_COMPLETE);
          visit.cheif_complaint = this.getCheifComplaint(visit);
          visit.visit_created = this.getEncounterCreated(visit, visitTypes.ADULTINITIAL);
          visit.prescription_sent = (vcenc) ? this.checkIfDateOldThanOneDay(vcenc.encounter_datetime.replace('Z','+0530')) : null;
          visit.person.age = this.calculateAge(visit.person.birthdate);
          records.push(visit);
        }
       // master list
      this.allPrescriptionSent = [...this.allPrescriptionSent, ...records];

      // apply search AFTER data loads5855
      this.applySearch();

        if(!this.loaded2) {;
          this.loaded2 = true;
        }
      }
    });
  }

 /**
  * Get FILRE DATA USING APPLY SEARCH 368
  * */

  applySearch() {
  if (!this.searchTerm) {
    this.prescriptionSent = [...this.allPrescriptionSent];
    return;
  }
  const term = this.searchTerm.toLowerCase();
  this.prescriptionSent = this.allPrescriptionSent.filter(visit => {
    const name = [
      visit.patient_name?.given_name,
      visit.patient_name?.middle_name,
      visit.patient_name?.family_name
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return name.includes(term);
  });
}


  /**
  * Get prescriptions sent visits for a given page number and search term
  * @param {Object} params - Object containing page, pageSize, and optional searchTerm
  * @return {void}
  */


 
  getPrescriptionSentVisitsData(params: {page: number, pageSize: number, searchTerm?: string}) {
      // Search → debounce
   if (params.searchTerm !== undefined) {
    this.sentSearch$.next(params.searchTerm);
    return;
  }
    this.getPrescriptionSentVisits(params.page);
  }

  /**
  * Get encounter datetime for a given encounter type
  * @param {CustomVisitModel} visit - Visit
  * @param {string} encounterName - Encounter type
  * @return {string} - Encounter datetime
  */
  getEncounterCreated(visit: CustomVisitModel, encounterName: string): string {
    let created_at: string = '';
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        created_at = this.getCreatedAt(encounter.encounter_datetime.replace('Z','+0530'));
      }
    });
    return created_at;
  }

  /**
  * Returns the created time in words from the date
  * @param {string} data - Date
  * @return {string} - Created time in words from the date
  */
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

  /**
  * Retreive the chief complaints for the visit
  * @param {CustomVisitModel} visit - The visit
  * @return {string[]} - Chief complaints array
  */
  getCheifComplaint(visit: CustomVisitModel): string[] {
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

  /**
  * Returns the age in years from the birthdate
  * @param {string} birthdate - Date in string format
  * @return {number} - Age
  */
  calculateAge(birthdate: string): number {
    return moment().diff(birthdate,'years');
  }

  /**
  * Check how old the date is from now
  * @param {string} data - Date in string format
  * @return {string} - Returns how old the date is from now
  */
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

  /**
  * Returns the ecounter for a given encounter type
  * @param {CustomEncounterModel[]} encounters - Array of visit encounters
  * @return {CustomEncounterModel} - Ecounter for a given encounter type
  */
  checkIfEncounterExists(encounters: CustomEncounterModel[], encounterType: string) {
    return encounters.find((enc: CustomEncounterModel) => enc.type.name == encounterType);
  }

  /**
  * Get doctor speciality
  * @param {ProviderAttributeModel[]} attr - Array of provider attributes
  * @return {string} - Doctor speciality
  */
  getSpecialization(attr: ProviderAttributeModel[]): string {
    let specialization: string = '';
    attr.forEach((a: ProviderAttributeModel) => {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

  ngOnDestroy() {
  this.sentSearch$.complete();
  this.completedSearch$.complete();
  this.referredSearch$.complete();
}
}
