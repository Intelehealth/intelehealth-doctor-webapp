import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AppointmentService } from "src/app/services/appointment.service";
import * as moment from "moment";
import { HelperService } from "src/app/services/helper.service";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
  gender: string;
  age: string;
  location: string;
  status: string;
  lastSeen: string;
  visitId: string;
  patientId: string;
  provider: string;
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
})
export class HomepageComponent implements OnInit {
  value: any = {};
  activePatient = 0;
  flagPatientNo = 0;
  visitNoteNo = 0;
  completeVisitNo = 0;
  endedVisitNo = 0;
  endVisitCount: any;
  endVisits = [];
  setSpiner1 = false;
  setSpiner2 = false;
  setSpiner3 = false;
  setSpiner4 = false;
  specialization;
  visitStateAttributeType = "0e798578-96c1-450b-9927-52e45485b151";
  specializationProviderType = "ed1715f5-93e2-404e-b3c9-2a2d9600f062";
  visitState = null;
  endVisitData: any;
  visits = []
  slots = []
  allVisits = [];
  limit = 100;
  allVisitsLoaded = false;
  loadMore = {
    priority: false,
    awaiting: false,
    inProgress: false,
    completed: false,
  }

  pages = {
    priority: 1,
    awaiting: 1,
    inProgress: 1,
    completed: 1,
  }

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private apnmntSvc: AppointmentService,
    private helper: HelperService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (getFromStorage("visitNoteProvider")) {
      deleteFromStorage("visitNoteProvider");
    }
    const userDetails = getFromStorage("user");
    if (userDetails) {
      this.sessionService.provider(userDetails.uuid).subscribe((provider) => {
        saveToStorage("provider", provider.results[0]);
        const attributes = provider.results[0].attributes;
        attributes.forEach((attribute) => {
          if (
            attribute.attributeType.uuid === this.specializationProviderType &&
            !attribute.voided
          ) {
            this.specialization = attribute.value;
          }
          if (
            attribute.attributeType.uuid ===
            this.sessionService.visitStateProviderType
          ) {
            this.visitState = attribute.value;
          }
        });
        const roles = userDetails['roles'];
        roles.forEach(role => {
          if (role.name === "Reporting Module") {
            this.specialization = "General Physician";
          }
        });
        this.getDrSlots();
        //  this.getVisits();
        this.getVisitCounts(this.specialization);
        this.getPriorityVisits();
        this.getAwaitingVisits();
        // this.getInProgressVisits();
        // this.getCompletedVisits();
      });
    } else {
      this.authService.logout();
    }
  }

  ngOnDestroy() {
    console.log('visit cleared...');
    this.service.clearVisits();
  }

  /**
   * Get all Awaiting Visits
   */
  getAwaitingVisits(page?) {
    this.setSpiner2 = true;
    this.service.getAwaitingVisits(this.visitState, this.specialization, page).subscribe(
      (response: any) => {
        this.setVisitByType(response.data, 'awaitingVisit');
        this.setSpiner2 = false;
        this.loadMore.awaiting = !!response?.data?.length;
        this.helper.refreshTable.next();
      });
  }

  /**
   * Get all Priority Visits
   */
  getPriorityVisits(page?) {
    this.setSpiner1 = true;
    this.service.getPriorityVisits(this.visitState, this.specialization, page).subscribe(
      (response: any) => {
        this.setVisitByType(response.data, 'priorityVisit');
        this.setSpiner1 = false;
        this.loadMore.priority = !!response?.data?.length;
        this.helper.refreshTable.next();
      });
  }

  /**
   * Get all InProgress Visits
   */
  getInProgressVisits(page?) {
    this.setSpiner3 = true;
    this.service.getInProgressVisits(this.visitState, this.specialization, page).subscribe(
      (response: any) => {
        this.setVisitByType(response.data, 'inProgressVisit');
        this.setSpiner3 = false;
        this.loadMore.inProgress = !!response?.data?.length;
        this.helper.refreshTable.next();
      });
  }

  /**
  * Get all Completed Visits
  */
  getCompletedVisits(page?) {
    this.setSpiner4 = true;
    this.service.getCompletedVisits(this.visitState, this.specialization, page).subscribe(
      (response: any) => {
        this.setVisitByType(response.data, 'completedVisit');
        this.setSpiner4 = false;
        this.loadMore.completed = !!response?.data?.length;
        this.helper.refreshTable.next();
      });
  }

  setVisitByType(stateVisits: any, typeOfVisit) {
    stateVisits.forEach(visit => {
      this.setVisitsWithData(visit, typeOfVisit);
    });
  }

  /**
* Check for a visit and put it to the respective tab as per their type
* @param visit Object
*/
  setVisitsWithData(visit, typeOfVisit) {
    let value: any = {};
    value.visitId = visit?.uuid;
    value.patientId = visit?.person?.uuid;
    value.id = visit?.patient?.identifier;
    value.name = visit?.patient_name?.given_name + " " + visit?.patient_name?.family_name;
    value.gender = visit.person.gender;
    value.age = this.getAge(visit.person.birthdate);
    value.location = visit?.location?.name;
    const encounter = this.getMaxEncounter(visit);
    value.status = encounter?.type?.name;
    value.provider = encounter?.encounter_provider?.provider?.person?.person_name?.given_name + " " +
      encounter?.encounter_provider?.provider?.person?.person_name?.family_name;
    value.lastSeen = encounter?.encounter_datetime;
    value.complaints = this.getComplaints(visit);

    value.disable = !!this.slots.find(slot => slot.openMrsId === value.id);
    if (typeOfVisit === 'awaitingVisit') {
      value.status = 'ADULTINITIAL';
      this.service.waitingVisit.push(value);
    } else if (typeOfVisit === 'inProgressVisit') {
      value.status = 'Visit Note';
      this.service.progressVisit.push(value);
    } else if (typeOfVisit === 'priorityVisit') {
      value.status = 'Flagged';
      this.service.flagVisit.push(value);
    } else if (typeOfVisit === 'completedVisit') {
      value.status = 'Visit Complete';
      this.service.completedVisit.push(value);
    }
  }

  /**
  * return age by birthdate
  */
  getAge(dateString) {
    let date1 = moment(dateString);
    var diffDuration = moment.duration(moment().diff(date1));
    return diffDuration.years();
  }

  getStateFromVisit(provider) {
    const attribute = provider.find(
      ({ attributeType }) => attributeType.uuid === this.visitStateAttributeType
    );
    return attribute && attribute.value ? attribute.value : "missing";
  }

  setVisits() {
    let stateVisits = [];
    if (this.visitState && this.visitState !== "All") {
      stateVisits = this.visits.filter(({ attributes }) => {
        const visitState = this.getStateFromVisit(attributes);
        return this.visitState === visitState;
      });
    } else if (this.visitState === "All") {
      stateVisits = this.visits;
    }

    stateVisits.forEach((active) => {
      if (active.encounters.length > 0) {
        if (active.attributes.length) {
          const attributes = active.attributes;
          const speRequired = attributes.filter(
            (attr) =>
              attr.attributeType.uuid ===
              "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
          );
          if (speRequired.length) {
            speRequired.forEach((spe, index) => {
              if (spe.value === this.specialization) {
                if (index === 0) {
                  this.visitCategory(active);
                }
                if (index === 1 && spe[0] !== spe[1]) {
                  this.visitCategory(active);
                }
              }
            });
          }
        } else if (this.specialization === "General Physician") {
          this.visitCategory(active);
        }
      }
      this.value = {};
    });
  }

  /**
   * Get all visits
   */
  getVisits(query: any = {}, cb = () => { }) {
    this.service.getVisits(query).subscribe(
      (response) => {
        response.results.forEach((item) => {
          this.allVisits = this.helper.getUpdatedValue(this.allVisits, item);
        });
        let stateVisits = [];
        if (this.visitState && this.visitState !== "All") {
          stateVisits = this.allVisits.filter(({ attributes }) => {
            const visitState = this.getStateFromVisit(attributes);
            return this.visitState === visitState;
          });
        } else if (this.visitState === "All") {
          stateVisits = this.allVisits;
        }

        stateVisits.forEach((active) => {
          if (active.encounters.length > 0) {
            if (active.attributes.length) {
              const attributes = active.attributes;
              const speRequired = attributes.filter(
                (attr) =>
                  attr.attributeType.uuid ===
                  "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
              );
              if (speRequired.length) {
                speRequired.forEach((spe, index) => {
                  if (spe.value === this.specialization) {
                    this.visitCategory(active);
                  }
                });
              }
            } else if (this.specialization === "General Physician") {
              this.visitCategory(active);
            }
          }
          this.value = {};
        });
        if (response.results.length === 0) {
          // this.setVisitlengthAsPerLoadedData();
          this.allVisitsLoaded = true;
        }
        this.helper.refreshTable.next();
        //this.setSpiner = false;
      },
      (err) => {
        if (err.error instanceof Error) {
          this.snackbar.open("Client-side error", null, { duration: 4000 });
        } else {
          this.snackbar.open("Server-side error", null, { duration: 4000 });
        }
      }
    );
  }

  /**
   * Check for encounter as per visit type passed
   * @param encounters Array
   * @param visitType String
   * @returns Object | null
   */
  checkVisit(encounters, visitType) {
    return encounters.find((enc: any) => enc?.type?.name === visitType);
  }

  getMaxEncounter(active) {
    const { encounters = [] } = active;
    let encounter = null;
    if (encounter = this.checkVisit(encounters, "Visit Complete")) {
    } else if (encounter = this.checkVisit(encounters, "Visit Note")) {
    } else if (encounter = this.checkVisit(encounters, "Flagged")) {
    } else if (
      (encounter = this.checkVisit(encounters, "ADULTINITIAL")) ||
      (encounter = this.checkVisit(encounters, "Vitals"))
    ) {
    }
    return encounter;
  }

  /**
   * Check for a visit and put it to the respective table as per their encounter
   * @param visitObject Object
   */
  visitCategory(active) {
    const { encounters = [] } = active;
    let encounter = null;
    if (encounter = this.checkVisit(encounters, "Visit Complete")) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.completedVisit.push(values);
    } else if (encounter = this.checkVisit(encounters, "Visit Note")) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.progressVisit.push(values);
    } else if (encounter = this.checkVisit(encounters, "Flagged")) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter);
        this.service.flagVisit.push(values);
      }
    } else if (
      (encounter = this.checkVisit(encounters, "ADULTINITIAL")) ||
      (encounter = this.checkVisit(encounters, "Vitals"))
    ) {
      const values = this.assignValueToProperty(active, encounter);
      this.service.waitingVisit.push(values);
    }
  }

  getEndedVisits() {
    this.service.getEndedVisits().subscribe((res) => {
      this.endVisitData = res.results
      let endvisits = this.endVisitData.filter(a => a.stopDatetime != null);
      endvisits.forEach(a => {
        this.endVisits.push(this.assignValueToProperty(a));
      });
    })
  }

  getVisitCounts(speciality) {
    const getTotal = (data, type) => {
      const item = data.find(({ Status }: any) => Status === type);
      return item?.Total || 0;
    };
    this.service.getVisitCounts(speciality).subscribe(({ data }: any) => {
      if (data.length) {
        this.flagPatientNo = getTotal(data, "Priority");
        this.activePatient = getTotal(data, "Awaiting Consult");
        localStorage.awaitingVisitsCount = this.activePatient;
        this.visitNoteNo = getTotal(data, "Visit In Progress");
        this.completeVisitNo = getTotal(data, "Completed Visit");
      }
    });
  }


  /**
   * Transform visit Object to make it compatible to show in the mat table
   * @param visitObject Object
   * @returns Object
   */
  assignValueToProperty(active, encounter?) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.age = active.patient.person.age;
    this.value.location = active.location.display;

    this.value.status = encounter?.encounterType?.display || active.encounters[0]?.encounterType.display;
    const provider = encounter?.encounterProviders?.[0]?.provider.display || active.encounters?.[0]?.encounterProviders?.[0]?.provider.display;
    this.value.provider = provider?.split("- ")?.[1] || 'Missing Encounters';

    this.value.lastSeen = encounter?.encounterDatetime || active?.encounters[0]?.encounterDatetime;

    this.value.complaints = this.getComplaints(active);
    this.value.disable = !!this.slots.find(slot => slot.openMrsId === this.value.id);
    return this.value;
  }

  getComplaints(visit) {
    const attr = Array.isArray(visit?.attributes) ? visit?.attributes : [];
    const complaint = attr.find(atr => atr.attribute_type_id === 8);
    let recent: any = []
    if (complaint) {
      recent = complaint.value_reference.split(',').filter(val => val)
    }

    return recent?.length ? recent : ["-"];
  }

  get userId() {
    try {
      return JSON.parse(localStorage.user).uuid;
    } catch (error) {
      return null;
    }
  }

  getDrSlots() {
    let toDate = moment().add(1, 'year');
    this.apnmntSvc
      .getAllSlotsBwDates(
        moment().format("DD/MM/YYYY"),
        toDate.format("DD/MM/YYYY")
      )
      .subscribe({
        next: (res: any) => {
          this.slots = res.data;
          this.setVisits();
        },
      });
  }

  // ngAfterViewChecked() {
  //   this.cdr.detectChanges();
  // }

  get nextPage() {
    return Number((this.allVisits.length / this.limit).toFixed()) + 2;
  }

  tableChange({ loadMore, refresh, tableFor }: any) {
    if (loadMore) {
      switch (tableFor) {
        case 'flagVisit':
          this.pages.priority++;
          this.getPriorityVisits(this.pages.priority);
          break;
        case 'waitingVisit':
          this.pages.awaiting++;
          this.getAwaitingVisits(this.pages.awaiting);
          break;
        case 'progressVisit':
          this.pages.inProgress++;
          this.getInProgressVisits(this.pages.inProgress);
          break;
        case 'completedVisit':
          this.pages.completed++;
          this.getCompletedVisits(this.pages.completed);
          break;
        default:
          break;
      }
    }
  }

  setVisitlengthAsPerLoadedData() {
    this.flagPatientNo = this.getLength(this.flagVisit);
    this.activePatient = this.getLength(this.waitingVisit);
    localStorage.awaitingVisitsCount = this.activePatient;
    this.visitNoteNo = this.getLength(this.progressVisit);
    this.completeVisitNo = this.getLength(this.completedVisit);
  }

  get completedVisit() {
    return this.service.completedVisit;
  }
  get progressVisit() {
    return this.service.progressVisit;
  }

  get flagVisit() {
    return this.service.flagVisit;
  }
  get waitingVisit() {
    return this.service.waitingVisit;
  }

  getLength(arr) {
    let data = [];
    arr.forEach((item) => {
      data = this.helper.getUpdatedValue(data, item, "id");
    });
    return data.filter((i) => i).slice().length;
  }

}
