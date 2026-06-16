import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AppointmentService } from '../services/appointment.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { SocketService } from '../services/socket.service';
import { Router } from '@angular/router';
import { CoreService } from '../services/core/core.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { getCacheData, checkIfDateOldThanOneDay } from '../utils/utility-functions';
import { doctorDetails, languages, visitTypes } from 'src/config/constant';
import { ApiResponseModel, AppointmentModel, CustomEncounterModel, CustomObsModel, CustomVisitModel, EncounterModel, EncounterProviderModel, ObsModel, ProviderAttributeModel, RecentVisitsApiResponseModel, RescheduleAppointmentModalResponseModel, VisitModel } from '../model/model';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  showAll: boolean = true;
  displayedColumns1: string[] = [
    "openMrsId",
    "patientName",
    "patientAge",
    "starts_in",
    "location",
    "cheif_complaint",
    "actions",
  ];
  displayedColumns2: string[] = [
    "openMrsId",
    "name",
    "age",
    "location",
    "cheif_complaint",
    "visit_created",
  ];
  displayedColumns3: string[] = [
    "openMrsId",
    "name",
    "age",
    "location",
    "cheif_complaint",
    "visit_created",
  ];
  displayedColumns4: string[] = [
    "openMrsId",
    "name",
    "age",
    "location",
    "encounter_provider",
    "cheif_complaint",
    "prescription_started",
  ];
  displayedColumns5: string[] = [
    "openMrsId",
    "name",
    "age",
    "location",
    "encounter_provider",
    "cheif_complaint",
    "followup_date",
  ];

  dataSource1 = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();
  dataSource4 = new MatTableDataSource<any>();
  dataSource5 = new MatTableDataSource<any>();

  baseUrl: string = environment.baseURL;
  recordsFetched: number = environment.recordsPerPage;
  appointments: AppointmentModel[] = [];
  priorityVisits: CustomVisitModel[] = [];
  awaitingVisits: CustomVisitModel[] = [];
  inProgressVisits: CustomVisitModel[] = [];
  followupVisits: CustomVisitModel[] = [];
  filteredFollowUpVisits: CustomVisitModel[] = [];

  specialization: string = "";
  appointmentsCount: number = 0;
  priorityVisitsCount: number = 0;
  awaitingVisitsCount: number = 0;
  inprogressVisitsCount: number = 0;
  followupVisitsCount: number = 0;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild("appointmentPaginator") appointmentPaginator: MatPaginator;
  @ViewChild("priorityPaginator") priorityPaginator: MatPaginator;
  @ViewChild("awaitingPaginator") awaitingPaginator: MatPaginator;
  @ViewChild("inprogressPaginator") inprogressPaginator: MatPaginator;
  @ViewChild("followupPaginator") followupPaginator: MatPaginator;

  @ViewChild("appointmentMatSort", { static: true })
  appointmentMatSort: MatSort;
  @ViewChild("awaitingMatSort", { static: true }) awaitingMatSort: MatSort;
  @ViewChild("priorityMatSort", { static: true }) priorityMatSort: MatSort;
  @ViewChild("inprogressMatSort", { static: true }) inprogressMatSort: MatSort;
  @ViewChild("followupMatSort", { static: true }) followupMatSort: MatSort;

  currentSort = { active: "visit_created", direction: "desc" };

  offset: number = environment.recordsPerPage;
  awatingRecordsFetched: number = 0;
  pageEvent1: PageEvent;
  pageIndex1: number = 0;
  pageSize1: number = 5;

  priorityRecordsFetched: number = 0;
  pageEvent2: PageEvent;
  pageIndex2: number = 0;
  pageSize2: number = 5;

  inprogressRecordsFetched: number = 0;
  pageEvent3: PageEvent;
  pageIndex3: number = 0;
  pageSize3: number = 5;

  appointmentRecordsFetched: number = 0;
  pageEvent4: PageEvent;
  pageIndex4: number = 0;
  pageSize4: number = 5;

  followupVisitsRecordsFetched: number = 0;
  pageEvent5: PageEvent;
  pageIndex5: number = 0;
  pageSize5: number = 5;

  @ViewChild("tempPaginator1") tempPaginator1: MatPaginator;
  @ViewChild("tempPaginator2") tempPaginator2: MatPaginator;
  @ViewChild("tempPaginator3") tempPaginator3: MatPaginator;
  @ViewChild("tempPaginator4") tempPaginator4: MatPaginator;

  @ViewChild("apSearchInput", { static: true }) apSearchElement: ElementRef;
  @ViewChild("prSearchInput", { static: true }) prSearchElement: ElementRef;
  @ViewChild("awSearchInput", { static: true }) awSearchElement: ElementRef;
  @ViewChild("ipSearchInput", { static: true }) ipSearchElement: ElementRef;
  @ViewChild("fuSearchInput", { static: true }) fuSearchElement: ElementRef;

  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  showDate: boolean = true;
  showRange: boolean = false;
  selectAll: boolean = false;
  showAllVisits: boolean = false;
  fromDate: string;
  toDate: string;

  constructor(
    private pageTitleService: PageTitleService,
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private socket: SocketService,
    private router: Router,
    private coreService: CoreService,
    private toastr: ToastrService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({
      title: "Dashboard",
      imgUrl: "assets/svgs/menu-info-circle.svg",
    });
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      } else {
        this.router.navigate(["/dashboard/get-started"]);
      }
      this.getVisitCountsForDashboard();
      this.getAwaitingVisits(1);
      this.getPriorityVisits(1);
      // this.getInProgressVisits(1);
    }
    this.socket.initSocket(true);
  }

  getVisitCountsForDashboard() {
    this.visitService
      .getVisitCountsForDashboard(
        getCacheData(true, doctorDetails.USER).uuid,
        this.specialization
      )
      .subscribe(({ data }: any) => {
        if (data) {
          this.inprogressVisitsCount = data.inProgressVisit;
          this.appointmentsCount = data.appointmentVisit;
        }
      });
  }

  /**
  * Get awaiting visits for a given page number
  * @param {number} page - Page number
  * @return {void}
  */
getAwaitingVisits(page: number = 1) {
  const isInitialPage = page === 1;

  if (isInitialPage) {
    this.awaitingVisits = [];
    this.awatingRecordsFetched = 0;
  }

  const sortField = "date_created";
  const sortOrder =
    this.currentSort.active === "visit_created"
      ? this.currentSort.direction || "desc"
      : "desc";

  this.visitService
    .getAwaitingVisits(this.specialization, page, sortField, sortOrder)
    .subscribe((res: ApiResponseModel) => {
      if (!res.success) return;

      const visits = res.data || [];
      const newFollowups = [];

      this.awatingRecordsFetched += this.offset;

      const processed = visits.map((visit) => {
        visit.cheif_complaint = this.getCheifComplaint(visit);
        visit.visit_created = visit.date_created;
        visit.uploaded_Date =
          visit.date_created
            ? this.getCreatedAt(visit.date_created)
            : this.getEncounterCreated(visit, visitTypes.FLAGGED)?.created_at;
        visit.age = this.visitService.calculateAge(visit.person.birthdate);
        visit.name =
          visit.patient_name.given_name +
          " " +
          (visit.patient_name.middle_name
            ? visit.patient_name.middle_name + " "
            : "") +
          visit.patient_name.family_name;
        visit.location = visit.sanch;
        visit.openMrsId = visit.patient?.identifier;
        const isFollowUp = visit.cheif_complaint.some((x) => x.includes("Follow"));

        if (isFollowUp) newFollowups.push(visit);

        return { ...visit, isFollowUp };
      });

      this.getFollowUpVisits(newFollowups);

      // Exclude follow-up visits from the awaiting list so a re-uploaded
      // follow-up patient appears only in the Follow-up section (PROD-185).
      const awaitingOnly = processed.filter((visit) => !visit.isFollowUp);
      // Reduce the backend count by the follow-ups removed from the loaded
      // page(s). Count may still drift slightly for pages not yet loaded.
      this.awaitingVisitsCount = res.totalCount - (processed.length - awaitingOnly.length);

      if (this.currentSort.active === "visit_created") {
        // For visit_created sorting, accumulate all loaded pages
        if (isInitialPage) {
          this.awaitingVisits = [...awaitingOnly];
        } else {
          this.awaitingVisits.push(...awaitingOnly);
        }
        this.dataSource3.sort = this.awaitingMatSort;
        this.dataSource3.data = this.awaitingVisits;

      } else {
        this.awaitingVisits.push(...awaitingOnly);
        this.dataSource3.sort = this.awaitingMatSort;
        this.applySorting();
      }

      if (isInitialPage) {
        this.dataSource3.paginator = this.tempPaginator2;
        this.tempPaginator2.pageIndex = 0;
      } else {
        this.tempPaginator2.length = this.awaitingVisitsCount;
        this.tempPaginator2.nextPage();
      }
    });
}


  /**
   * Callback for page change event and Get awaiting visit for a selected page index and page size
   * @param {PageEvent} event - onerror event
   * @return {void}
   */
  public getAwaitingData(event?: PageEvent) {
    this.pageIndex1 = event.pageIndex;
    this.pageSize1 = event.pageSize;
    if (this.dataSource3.filter) {
      this.awaitingPaginator.firstPage();
    }
    if ((event.pageIndex + 1) * this.pageSize1 > this.awatingRecordsFetched) {
      this.getAwaitingVisits(
        (this.awatingRecordsFetched + this.offset) / this.offset
      );
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator2.nextPage();
      } else {
        this.tempPaginator2.previousPage();
      }
    }
    return event;
  }

  /**
   * Get priority visits for a given page number
   * @param {number} page - Page number
   * @return {void}
   */
  getPriorityVisits(page: number = 1) {
    if (page == 1) {
      this.priorityVisits = [];
      this.priorityRecordsFetched = 0;
    }
    let newfollowupVisits = [];
    this.visitService
      .getPriorityVisits(this.specialization, page)
      .subscribe((pv: ApiResponseModel) => {
        if (pv.success) {
          // this.priorityVisitsCount = pv.totalCount;
          this.priorityRecordsFetched += this.offset;
          for (let i = 0; i < pv.data.length; i++) {
            let visit = pv.data[i];
            visit.cheif_complaint = this.getCheifComplaint(visit);
            visit.visit_created = visit?.date_created;
            visit.uploaded_Date = visit?.date_created
              ? this.getCreatedAt(visit.date_created)
              : this.getEncounterCreated(visit, visitTypes.FLAGGED)?.created_at;
            visit.age = this.visitService.calculateAge(visit.person.birthdate);
            visit.name =
              visit.patient_name.given_name +
              " " +
              (visit.patient_name?.middle_name
                ? visit.patient_name?.middle_name + " "
                : "") +
              " " +
              visit.patient_name.family_name;
            visit.location = visit?.sanch;
            visit.openMrsId = visit?.patient?.identifier;
            if (
              visit.cheif_complaint.filter((f) => f.includes("Follow")).length >
              0
            ) {
              if (
                !this.visitService
                  .getPatientVerdict(visit)
                  .includes("Patient is feeling better")
              ) {
                newfollowupVisits.push(visit);
              } else {
                this.closeFollowUpVisit(visit);
              }
            } else {
              this.priorityVisits.push(visit);
            }
          }
          this.priorityVisitsCount = pv.totalCount;
          this.getFollowUpVisits(newfollowupVisits);
          this.priorityVisits.sort((a, b) =>
            new Date(b.date_created) < new Date(a.date_created) ? -1 : 1
          );
          this.dataSource2.data = [...this.priorityVisits];
          if (page == 1) {
            this.dataSource2.paginator = this.tempPaginator1;
            this.dataSource2.sort = this.priorityMatSort;
            this.dataSource2.filterPredicate = (data, filter: string) =>
              data?.patient.identifier.toLowerCase().indexOf(filter) != -1 ||
              data?.patient_name.given_name
                .concat(
                  (data?.patient_name.middle_name
                    ? " " + data?.patient_name.middle_name
                    : "") +
                    " " +
                    data?.patient_name.family_name
                )
                .toLowerCase()
                .indexOf(filter) != -1 ||
              data?.location.toLowerCase().indexOf(filter) != -1 ||
              // data?.age.toLowerCase().indexOf(filter) != -1 ||
              data?.cheif_complaint.find(
                (c) => c.toLowerCase() === filter.toLowerCase()
              );
          } else {
            this.tempPaginator1.length = pv.totalCount;
            this.tempPaginator1.nextPage();
          }
        }
      });
  }

  /**
   * Callback for page change event and Get priority visit for a selected page index and page size
   * @param {PageEvent} event - onerror event
   * @return {void}
   */
  public getPriorityData(event?: PageEvent) {
    this.pageIndex2 = event.pageIndex;
    this.pageSize2 = event.pageSize;
    if (this.dataSource2.filter) {
      this.priorityPaginator.firstPage();
    }
    if ((event.pageIndex + 1) * this.pageSize2 > this.priorityRecordsFetched) {
      this.getPriorityVisits(
        (this.priorityRecordsFetched + this.offset) / this.offset
      );
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator1.nextPage();
      } else {
        this.tempPaginator1.previousPage();
      }
    }
    return event;
  }

  /**
   * Get inprogress visits for a given page number
   * @param {number} page - Page number
   * @return {void}
   */
  getInProgressVisits(page: number = 1) {
    if (page == 1) {
      this.inProgressVisits = [];
      this.inprogressRecordsFetched = 0;
    }
    this.visitService
      .getInProgressVisits(this.specialization, page)
      .subscribe((iv: ApiResponseModel) => {
        if (iv.success) {
          this.inprogressVisitsCount = iv.totalCount;
          this.inprogressRecordsFetched += this.offset;
          for (let i = 0; i < iv.data.length; i++) {
            let visit = iv.data[i];
            visit.cheif_complaint = this.getCheifComplaint(visit);
            visit.visit_created = visit?.date_created
              ? this.getCreatedAt(visit.date_created)
              : this.getEncounterCreated(visit, visitTypes.ADULTINITIAL)
                  ?.created_at;
            visit.prescription_startedDate = this.getEncounterCreated(
              visit,
              visitTypes.VISIT_NOTE
            )?.created_at;
            visit.prescription_started = this.getEncounterCreated(
              visit,
              visitTypes.VISIT_NOTE
            )?.encounterDateTime;
            console.log(
              "prescription_started",
              visit.prescription_started,
              new Date(visit.prescription_started)
            );
            visit.encounter_provider = this.getEncounterProviderName(
              visit,
              visitTypes.VISIT_NOTE
            );
            visit.age = this.visitService.calculateAge(visit.person.birthdate);
            visit.name =
              visit.patient_name.given_name +
              " " +
              (visit.patient_name?.middle_name
                ? visit.patient_name?.middle_name + " "
                : "") +
              " " +
              visit.patient_name.family_name;
            visit.location = visit?.sanch;
            visit.openMrsId = visit?.patient?.identifier;
            this.inProgressVisits.push(visit);
          }
          this.inProgressVisits.sort((a, b) =>
            new Date(b.prescription_started) < new Date(a.prescription_started)
              ? -1
              : 1
          );
          this.dataSource4.data = [...this.inProgressVisits];
          if (page == 1) {
            this.dataSource4.paginator = this.tempPaginator3;
            this.dataSource4.sort = this.inprogressMatSort;
            this.dataSource4.filterPredicate = (data, filter: string) =>
              data?.patient.identifier.toLowerCase().indexOf(filter) != -1 ||
              data?.encounter_provider.toLowerCase().indexOf(filter) != -1 ||
              data?.patient_name.given_name
                .concat(
                  (data?.patient_name.middle_name
                    ? " " + data?.patient_name.middle_name
                    : "") +
                    " " +
                    data?.patient_name.family_name
                )
                .toLowerCase()
                .indexOf(filter) != -1 ||
              data?.location.toLowerCase().indexOf(filter) != -1 ||
              // data?.age.toLowerCase().indexOf(filter) != -1 ||
              data?.cheif_complaint.find(
                (c) => c.toLowerCase() === filter.toLowerCase()
              );
          } else {
            this.tempPaginator3.length = this.inProgressVisits.length;
            this.tempPaginator3.nextPage();
          }
        }
      });
  }

  /**
   * Get inprogress visits for a given page number
   * @param {number} page - Page number
   * @return {void}
   */
  getFollowUpVisits(visits, page: number = 1) {
    (this.followupVisits = []), (this.filteredFollowUpVisits = []);
    for (let i = 0; i < visits.length; i++) {
      let visit = visits[i];
      this.visitService.recentVisits(visit.person.uuid).subscribe((res) => {
        const visits = res.results;
        let recentVisit = visits.filter(
          (v) =>
            v.uuid !== visit.uuid &&
            v.encounters.filter(
              (e) =>
                e.encounterType.display == visitTypes.PATIENT_EXIT_SURVEY ||
                e.encounterType.display == visitTypes.VISIT_COMPLETE
            ).length > 0
        );
        visit.age = this.visitService.calculateAge(visit.person.birthdate);
        visit.name =
          visit.patient_name.given_name +
          " " +
          (visit.patient_name?.middle_name
            ? visit.patient_name?.middle_name + " "
            : "") +
          " " +
          visit.patient_name.family_name;
        visit.location = visit?.sanch;
        visit.openMrsId = visit?.patient?.identifier;
        if (recentVisit.length > 0) {
          visit.followup_date = this.visitService.getFollowupDate(
            recentVisit[0],
            visitTypes.VISIT_NOTE
          );
          visit.encounter_provider = recentVisit[0]?.encounters
            .filter(
              (e) =>
                e.encounterType.display == visitTypes.PATIENT_EXIT_SURVEY ||
                e.encounterType.display == visitTypes.VISIT_COMPLETE
            )[0]
            .encounterProviders[0].display.split(":")[0];
        }
        this.followupVisits.push(visit);
        this.filteredFollowUpVisits = this.followupVisits.filter((visit) => {
          return (
            !visit.encounter_provider ||
            visit.encounter_provider ==
            getCacheData(false, doctorDetails.DOCTOR_NAME)
          );
        });
        this.filteredFollowUpVisits.sort((a, b) =>
          new Date(b.followup_date) < new Date(a.followup_date) ? -1 : 1
        );
        this.dataSource5.data = [...this.filteredFollowUpVisits];
        this.followupVisitsCount = this.filteredFollowUpVisits.length;
        if (page == 1) {
          this.dataSource5.paginator = this.tempPaginator4;
          this.dataSource5.sort = this.followupMatSort;
          this.dataSource5.filterPredicate = (data, filter: string) =>
            data?.patient.identifier.toLowerCase().indexOf(filter) != -1 ||
            data?.encounter_provider.toLowerCase().indexOf(filter) != -1 ||
            data?.patient_name.given_name
              .concat(
                (data?.patient_name.middle_name
                  ? " " + data?.patient_name.middle_name
                  : "") +
                  " " +
                  data?.patient_name.family_name
              )
              .toLowerCase()
              .indexOf(filter) != -1 ||
            data?.location.toLowerCase().indexOf(filter) != -1 ||
            // data?.age.toLowerCase().indexOf(filter) != -1 ||
            data?.cheif_complaint.find(
              (c) => c.toLowerCase() === filter.toLowerCase()
            );
        } else {
          this.tempPaginator4.length = this.filteredFollowUpVisits.length;
          this.tempPaginator4.nextPage();
        }
      });
    }
  }

  /**
   * Callback for page change event and Get inprogress visit for a selected page index and page size
   * @param {PageEvent} event - onerror event
   * @return {void}
   */
  public getInprogressData(event?: PageEvent) {
    this.pageIndex3 = event.pageIndex;
    this.pageSize3 = event.pageSize;
    if (this.dataSource4.filter) {
      this.inprogressPaginator.firstPage();
    }
    if (
      (event.pageIndex + 1) * this.pageSize3 >
      this.inprogressRecordsFetched
    ) {
      this.getInProgressVisits(
        (this.inprogressRecordsFetched + this.offset) / this.offset
      );
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator3.nextPage();
      } else {
        this.tempPaginator3.previousPage();
      }
    }
    return event;
  }

  /**
   * Callback for page change event and Get Follow-Up visit for a selected page index and page size
   * @param {PageEvent} event - onerror event
   * @return {void}
   */
  public getFollowUpData(event?: PageEvent) {
    this.pageIndex3 = event.pageIndex;
    this.pageSize3 = event.pageSize;
    if (this.dataSource5.filter) {
      this.followupPaginator.firstPage();
    }
    if ((event.pageIndex + 1) * this.pageSize3 > this.recordsFetched) {
      this.getFollowUpVisits((this.recordsFetched + this.offset) / this.offset);
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator4.nextPage();
      } else {
        this.tempPaginator4.previousPage();
      }
    }
    return event;
  }

  /**
   * Get booked appointments for a logged-in doctor in a current year
   * @return {void}
   */
  getAppointments() {
    this.appointments = [];
    this.appointmentService
      .getUserSlots(
        getCacheData(true, doctorDetails.USER).uuid,
        moment().startOf("year").format("DD/MM/YYYY"),
        moment().endOf("year").format("DD/MM/YYYY")
      )
      .subscribe((res: ApiResponseModel) => {
        let appointmentsdata = res.data;
        appointmentsdata.forEach((appointment: AppointmentModel) => {
          if (
            appointment.status == "booked" &&
            (appointment.visitStatus == "Awaiting Consult" ||
              appointment.visitStatus == "Visit In Progress")
          ) {
            if (appointment.visit) {
              appointment.cheif_complaint = this.getCheifComplaint(
                appointment.visit
              );
              appointment.starts_in = checkIfDateOldThanOneDay(
                appointment.slotJsDate
              );
              appointment.location = appointment?.visit?.sanch;
              appointment.openMrsId = appointment?.openMrsId;
              this.appointments.push(appointment);
            }
          }
        });
        this.appointmentsCount = this.appointments.length;
        this.dataSource1.data = [...this.appointments];
        this.dataSource1.paginator = this.appointmentPaginator;
        this.dataSource1.sort = this.appointmentMatSort;
        this.dataSource1.filterPredicate = (data, filter: string) =>
          data?.openMrsId.toLowerCase().indexOf(filter) != -1 ||
          data?.patientName.toLowerCase().indexOf(filter) != -1 ||
          data?.location.toLowerCase().indexOf(filter) != -1 ||
          // data?.age.toLowerCase().indexOf(filter) != -1 ||
          data?.cheif_complaint.find(
            (c) => c.toLowerCase() === filter.toLowerCase()
          );
      });
  }

  /**
   * Get encounter datetime for a given encounter type
   * @param {CustomVisitModel} visit - Visit
   * @param {string} encounterName - Encounter type
   * @return {string} - Encounter datetime
   */
  getEncounterCreated(visit: CustomVisitModel, encounterName: string) {
    let data = { created_at: "", encounterDateTime: "" };
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        data.created_at = this.getCreatedAt(encounter.encounter_datetime);
        data.encounterDateTime = encounter.encounter_datetime;
      }
    });
    return data;
  }

  /**
   * Get encounter Provider Name for a given encounter type
   * @param {CustomVisitModel} visit - Visit
   * @param {string} encounterName - Encounter type
   * @return {string} - Encounter ProviderName
   */
  getEncounterProviderName(visit: CustomVisitModel, encounterName: string) {
    let providerName = "";
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(encounterName) !== null) {
        providerName =
          encounter.encounter_provider.provider.person.person_name.given_name.concat(
            " ",
            encounter.encounter_provider.provider.person.person_name.family_name
          );
      }
    });
    return providerName;
  }

  /**
   * Retreive the chief complaints for the visit
   * @param {CustomVisitModel} visit - Visit
   * @return {string[]} - Chief complaints array
   */
  getCheifComplaint(visit: CustomVisitModel) {
    let recent: string[] = [];
    const encounters = visit.encounters;
    encounters.forEach((encounter: CustomEncounterModel) => {
      const display = encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        for (const currentObs of obs) {
          if (currentObs.concept_id == 163212) {
            const currentComplaint = this.visitService
              .getData2(currentObs)
              ?.value_text.replace(new RegExp("►", "g"), "")
              .split("<b>");
            for (let i = 1; i < currentComplaint.length; i++) {
              const obs1 = currentComplaint[i].split("<");
              if (!obs1[0].match(visitTypes.ASSOCIATED_SYMPTOMS)) {
                recent.push(obs1[0]);
              }
            }
            break;
          }
        }
      }
    });
    return recent;
  }

  /**
   * Returns the created time in words from the date
   * @param {string} data - Date
   * @return {string} - Created time in words from the date
   */
  getCreatedAt(data: string) {
    let hours = moment().diff(moment(data), "hours");
    let minutes = moment().diff(moment(data), "minutes");
    if (hours > 24) {
      return moment(data).format("DD MMM, YYYY");
    }
    if (hours < 1) {
      return `${minutes} minutes ago`;
    }
    return `${hours} hrs ago`;
  }

  /**
   * Get doctor speciality
   * @param {ProviderAttributeModel[]} attr - Array of provider attributes
   * @return {string} - Doctor speciality
   */
  getSpecialization(attr: ProviderAttributeModel[]) {
    let specialization = "";
    attr.forEach((a: ProviderAttributeModel) => {
      if (
        a.attributeType.uuid == "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
        !a.voided
      ) {
        specialization = a.value;
      }
    });
    return specialization;
  }

  /**
   * Reschedule appointment
   * @param {AppointmentModel} appointment - Appointment to be rescheduled
   * @return {void}
   */
  reschedule(appointment: AppointmentModel) {
    const len = appointment.visit.encounters.filter(
      (e: CustomEncounterModel) => {
        return (
          e.type.name == visitTypes.PATIENT_EXIT_SURVEY ||
          e.type.name == visitTypes.VISIT_COMPLETE
        );
      }
    ).length;
    const isCompleted = Boolean(len);
    if (isCompleted) {
      this.toastr.error(
        "Visit is already completed, it can't be rescheduled.",
        "Rescheduling failed"
      );
    } else if (appointment.visitStatus == "Visit In Progress") {
      this.toastr.error(
        this.translateService.instant(
          "Visit is in progress, it can't be rescheduled."
        ),
        this.translateService.instant("Rescheduling failed!")
      );
    } else {
      this.coreService
        .openRescheduleAppointmentModal(appointment)
        .subscribe((res: RescheduleAppointmentModalResponseModel) => {
          if (res) {
            let newSlot = res;
            this.coreService
              .openRescheduleAppointmentConfirmModal({ appointment, newSlot })
              .subscribe((result: boolean) => {
                if (result) {
                  appointment.appointmentId = appointment.id;
                  appointment.slotDate = moment(
                    newSlot.date,
                    "YYYY-MM-DD"
                  ).format("DD/MM/YYYY");
                  appointment.slotTime = newSlot.slot;
                  this.appointmentService
                    .rescheduleAppointment(appointment)
                    .subscribe((res: ApiResponseModel) => {
                      const message = res.message;
                      if (res.status) {
                        this.getAppointments();
                        this.toastr.success(
                          "The appointment has been rescheduled successfully!",
                          "Rescheduling successful!"
                        );
                      } else {
                        this.toastr.success(message, "Rescheduling failed!");
                      }
                    });
                }
              });
          }
        });
    }
  }

  /**
   * Cancel appointment
   * @param {AppointmentModel} appointment - Appointment to be rescheduled
   * @return {void}
   */
  cancel(appointment: AppointmentModel) {
    if (appointment.visitStatus == "Visit In Progress") {
      this.toastr.error(
        this.translateService.instant(
          "Visit is in progress, it can't be cancelled."
        ),
        this.translateService.instant("Canceling failed!")
      );
      return;
    }
    this.coreService
      .openConfirmCancelAppointmentModal(appointment)
      .subscribe((res: boolean) => {
        if (res) {
          this.toastr.success(
            "The Appointment has been successfully canceled.",
            "Canceling successful"
          );
          this.getAppointments();
        }
      });
  }

  /**
   * Play notification sound
   * @return {void}
   */
  playNotify() {
    const audioUrl = "assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  /**
   * Clear filter from a datasource 1
   * @return {void}
   */
  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Clear filter from a datasource 2
   * @return {void}
   */
  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    this.tempPaginator1.firstPage();
    this.priorityPaginator.firstPage();
  }

  /**
   * Clear filter from a datasource 3
   * @return {void}
   */
  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    this.tempPaginator2.firstPage();
    this.awaitingPaginator.firstPage();
  }

  /**
   * Clear filter from a datasource 4
   * @return {void}
   */
  applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    this.tempPaginator3.firstPage();
    this.inprogressPaginator.firstPage();
  }

  /**
   * Clear filter from a datasource 5
   * @return {void}
   */
  applyFilter5(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource5.filter = filterValue.trim().toLowerCase();
    this.tempPaginator4.firstPage();
    this.followupPaginator.firstPage();
  }

  /**
   * Clear filter from a given datasource
   * @param {string} dataSource - Datasource name
   * @return {void}
   */
  clearFilter(dataSource: string) {
    switch (dataSource) {
      case "Appointment":
        this.dataSource1.filter = null;
        this.apSearchElement.nativeElement.value = "";
        break;
      case "Priority":
        this.dataSource2.filter = null;
        this.prSearchElement.nativeElement.value = "";
        break;
      case "Awaiting":
        this.dataSource3.filter = null;
        this.awSearchElement.nativeElement.value = "";
        break;
      case "In-progress":
        this.dataSource4.filter = null;
        this.ipSearchElement.nativeElement.value = "";
        break;
      case "Follow-up":
        this.dataSource5.filter = null;
        this.fuSearchElement.nativeElement.value = "";
        break;
      default:
        break;
    }
  }

  applyDateFilter(showAllVisits: boolean) {
    let filteredVisits: CustomVisitModel[] = [];
    let visits = this.filteredFollowUpVisits;
    this.followupVisitsCount = 0;
    if (this.fromDate && this.toDate) {
      filteredVisits = visits.filter((visit) => {
        return (
          new Date(visit.followup_date).toISOString().slice(0, 10) >=
            this.fromDate &&
          new Date(visit.followup_date).toISOString().slice(0, 10) <=
            this.toDate
        );
      });
    } else if (this.fromDate) {
      filteredVisits = visits.filter((visit) => {
        return (
          new Date(visit.followup_date).toISOString().slice(0, 10) ==
          this.fromDate
        );
      });
    } else if (showAllVisits) {
      filteredVisits = this.followupVisits;
    }
    filteredVisits.sort((a, b) =>
      new Date(b.followup_date) < new Date(a.followup_date) ? -1 : 1
    );
    this.dataSource5.data = [...filteredVisits];
    this.tempPaginator4.length = filteredVisits.length;
    this.tempPaginator4.firstPage();
    this.followupVisitsCount = filteredVisits.length;
    this.trigger.closeMenu();
  }

  resetFilter() {
    this.dataSource5.data = [...this.filteredFollowUpVisits];
    this.tempPaginator4.length = this.filteredFollowUpVisits.length;
    this.tempPaginator4.firstPage();
    this.followupVisitsCount = this.filteredFollowUpVisits.length;
    this.selectAll = false;
    this.trigger.closeMenu();
    this.fromDate = null;
    this.toDate = null;
  }

  selectAllVisits(event) {
    this.selectAll = event.target.checked;
  }

  /** Get the selected date from the date picker
   *  @return {void}
   * */
  get isDatesValid() {
    return this.fromDate && this.toDate
      ? new Date(this.fromDate).getTime() > new Date(this.toDate).getTime()
      : false;
  }

  closeFollowUpVisit(visit) {
    const myDate = new Date(Date.now() - 30000);
    const json = {
      stopDatetime: myDate,
    };
    this.visitService.closeVisit(visit.uuid, json).subscribe(() => {});
  }
ngAfterViewInit() {
  // Set initial sort arrow state to match default sort
  this.awaitingMatSort.active = this.currentSort.active;
  this.awaitingMatSort.direction = this.currentSort.direction as 'asc' | 'desc' | '';

  this.awaitingMatSort.sortChange.subscribe(sort => {
    this.currentSort = sort;
    if (sort.active === 'visit_created') {
      // Reset data
      this.awaitingVisits = [];
      this.awatingRecordsFetched = 0;
      this.dataSource3.data = [];
      this.pageIndex1 = 0;

      // Reset BOTH paginators
      if (this.tempPaginator2) {
        this.tempPaginator2.pageIndex = 0;
        this.tempPaginator2.firstPage();
      }

      if (this.awaitingPaginator) {
        this.awaitingPaginator.pageIndex = 0;
        this.awaitingPaginator.firstPage();
      }

      // Fetch sorted, page=1
      this.getAwaitingVisits(1);
    } else {
      this.applySorting();
    }
  });
}

 applySorting() {
  // if sortapplySortinging is inactive for this column
  if (this.currentSort?.active === 'visit_created') {
    return;
  }
  const { active, direction } = this.currentSort;  // Filter out undefined elements first
  // Filter out undefined elements first
  const validVisits = this.awaitingVisits.filter(visit => visit !== undefined);
  if (!direction) {
    this.dataSource3.data = [...validVisits];
    return;
  }

  // Create a copy before sorting to avoid mutating the original array
  const sorted = [...validVisits].sort((a, b) => {
    // Handle undefined values
    if (!a || !b) return 0;

    const aValue = a[active];
    const bValue = b[active];

    // Handle undefined or null values
    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    // Number compare first (for age, etc.) - check if value is a number type or purely numeric
    const aNum = Number(aValue);
    const bNum = Number(bValue);
    if (!isNaN(aNum) && !isNaN(bNum) && typeof aValue !== 'string') {
      return direction === 'asc'
        ? aNum - bNum
        : bNum - aNum;
    }

    // Date compare - only if value looks like a date string (contains -, /, or is ISO format)
    const isDateLike = (val: any) => {
      if (typeof val !== 'string') return false;
      return val.includes('-') || val.includes('/') || val.includes('T');
    };

    if (isDateLike(aValue) && isDateLike(bValue)) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
        return direction === 'asc'
          ? aDate.getTime() - bDate.getTime()
          : bDate.getTime() - aDate.getTime();
      }
    }

    // String compare
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return direction === 'asc'
      ? (aStr > bStr ? 1 : -1)
      : (aStr < bStr ? 1 : -1);
  });
  this.dataSource3.data = sorted;
}
}
