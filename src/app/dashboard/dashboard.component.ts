import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails, languages, visitTypes } from 'src/config/constant';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  showAll: boolean = true;
  displayedColumns1: string[] = ['name', 'age', 'starts_in', 'location', 'cheif_complaint', 'actions'];
  displayedColumns2: string[] = ['name', 'age', 'location', 'cheif_complaint', 'visit_created'];
  displayedColumns3: string[] = ['name', 'age', 'location', 'cheif_complaint', 'visit_created'];
  displayedColumns4: string[] = ['name', 'age', 'location', 'cheif_complaint', 'prescription_started'];

  dataSource1 = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  dataSource3 = new MatTableDataSource<any>();
  dataSource4 = new MatTableDataSource<any>();

  baseUrl: string = environment.baseURL;
  appointments: any = [];
  priorityVisits: any = [];
  awaitingVisits: any = [];
  inProgressVisits: any = [];

  specialization: string = '';
  priorityVisitsCount: number = 0;
  awaitingVisitsCount: number = 0;
  inprogressVisitsCount: number = 0;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('appointmentPaginator') appointmentPaginator: MatPaginator;
  @ViewChild('priorityPaginator') priorityPaginator: MatPaginator;
  @ViewChild('awaitingPaginator') awaitingPaginator: MatPaginator;
  @ViewChild('inprogressPaginator') inprogressPaginator: MatPaginator;

  offset: number = environment.recordsPerPage;
  awatingRecordsFetched: number = 0;
  pageEvent1: PageEvent;
  pageIndex1:number = 0;
  pageSize1:number = 5;

  priorityRecordsFetched: number = 0;
  pageEvent2: PageEvent;
  pageIndex2:number = 0;
  pageSize2:number = 5;

  inprogressRecordsFetched: number = 0;
  pageEvent3: PageEvent;
  pageIndex3:number = 0;
  pageSize3:number = 5;

  appointmentRecordsFetched: number = 0;
  pageEvent4: PageEvent;
  pageIndex4:number = 0;
  pageSize4:number = 5;

  @ViewChild('tempPaginator1') tempPaginator1: MatPaginator;
  @ViewChild('tempPaginator2') tempPaginator2: MatPaginator;
  @ViewChild('tempPaginator3') tempPaginator3: MatPaginator;

  @ViewChild('apSearchInput', { static: true }) apSearchElement: ElementRef;
  @ViewChild('prSearchInput', { static: true }) prSearchElement: ElementRef;
  @ViewChild('awSearchInput', { static: true }) awSearchElement: ElementRef;
  @ViewChild('ipSearchInput', { static: true }) ipSearchElement: ElementRef;

  constructor(
    private pageTitleService: PageTitleService,
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private socket: SocketService,
    private router: Router,
    private coreService: CoreService,
    private toastr: ToastrService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Dashboard", imgUrl: "assets/svgs/menu-info-circle.svg" });
    let provider = getCacheData(true, doctorDetails.PROVIDER);
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
      } else {
        this.router.navigate(['/dashboard/get-started']);
      }
      this.getAppointments();
      this.getAwaitingVisits(1);
      this.getPriorityVisits(1);
      this.getInProgressVisits(1);
    }

    this.socket.initSocket(true);
  }

  getAwaitingVisits(page: number = 1) {
    if(page == 1) this.awaitingVisits = [];
    this.visitService.getAwaitingVisits(this.specialization, page).subscribe((av: any) => {
      if (av.success) {
        this.awaitingVisitsCount = av.totalCount;
        this.awatingRecordsFetched += this.offset;
        for (let i = 0; i < av.data.length; i++) {
          let visit = av.data[i];
          visit.cheif_complaint = this.getCheifComplaint2(visit);
          visit.visit_created = this.getEncounterCreated2(visit, visitTypes.ADULTINITIAL);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.awaitingVisits.push(visit);
        }
        this.dataSource3 = new MatTableDataSource(this.awaitingVisits);
        if (page == 1) {
          this.dataSource3.paginator = this.tempPaginator2;
          this.dataSource3.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator2.nextPage();
        }
      }
    });
  }

  public getAwaitingData(event?:PageEvent){
    this.pageIndex1 = event.pageIndex;
    this.pageSize1 = event.pageSize;
    if (this.dataSource3.filter) {
      this.awaitingPaginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize1) > this.awatingRecordsFetched) {
      this.getAwaitingVisits((this.awatingRecordsFetched+this.offset)/this.offset);
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator2.nextPage();
      } else {
        this.tempPaginator2.previousPage();
      }
    }
    return event;
  }

  getPriorityVisits(page: number = 1) {
    if(page == 1) this.priorityVisits = [];
    this.visitService.getPriorityVisits(this.specialization, page).subscribe((pv: any) => {
      if (pv.success) {
        this.priorityVisitsCount = pv.totalCount;
        this.priorityRecordsFetched += this.offset;
        for (let i = 0; i < pv.data.length; i++) {
          let visit = pv.data[i];
          visit.cheif_complaint = this.getCheifComplaint2(visit);
          visit.visit_created = this.getEncounterCreated2(visit, visitTypes.FLAGGED);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.priorityVisits.push(visit);
        }
        this.dataSource2 = new MatTableDataSource(this.priorityVisits);
        if (page == 1) {
          this.dataSource2.paginator = this.tempPaginator1;
          this.dataSource2.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator1.nextPage();
        }
      }
    });
  }

  public getPriorityData(event?:PageEvent){
    this.pageIndex2 = event.pageIndex;
    this.pageSize2 = event.pageSize;
    if (this.dataSource2.filter) {
      this.priorityPaginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize2) > this.priorityRecordsFetched) {
      this.getPriorityVisits((this.priorityRecordsFetched+this.offset)/this.offset);
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator1.nextPage();
      } else {
        this.tempPaginator1.previousPage();
      }
    }
    return event;
  }

  getInProgressVisits(page: number = 1) {
    if(page == 1) this.inProgressVisits = [];
    this.visitService.getInProgressVisits(this.specialization, page).subscribe((iv: any) => {
      if (iv.success) {
        this.inprogressVisitsCount = iv.totalCount;
        this.inprogressRecordsFetched += this.offset;
        for (let i = 0; i < iv.data.length; i++) {
          let visit = iv.data[i];
          visit.cheif_complaint = this.getCheifComplaint2(visit);
          visit.visit_created = this.getEncounterCreated2(visit, visitTypes.ADULTINITIAL);
          visit.prescription_started = this.getEncounterCreated2(visit, visitTypes.VISIT_NOTE);
          visit.person.age = this.calculateAge(visit.person.birthdate);
          this.inProgressVisits.push(visit);
        }
        this.dataSource4 = new MatTableDataSource(this.inProgressVisits);
        if (page == 1) {
          this.dataSource4.paginator = this.tempPaginator3;
          this.dataSource4.filterPredicate = (data: any, filter: string) => data?.patient.identifier.toLowerCase().indexOf(filter) != -1 || data?.patient_name.given_name.concat(' ' + data?.patient_name.family_name).toLowerCase().indexOf(filter) != -1;
        } else {
          this.tempPaginator3.nextPage();
        }
      }
    });
  }

  public getInprogressData(event?:PageEvent){
    this.pageIndex3 = event.pageIndex;
    this.pageSize3 = event.pageSize;
    if (this.dataSource4.filter) {
      this.inprogressPaginator.firstPage();
    }
    if (((event.pageIndex+1)*this.pageSize3) > this.inprogressRecordsFetched) {
      this.getInProgressVisits((this.inprogressRecordsFetched+this.offset)/this.offset);
    } else {
      if (event.previousPageIndex < event.pageIndex) {
        this.tempPaginator3.nextPage();
      } else {
        this.tempPaginator3.previousPage();
      }
    }
    return event;
  }

  getAppointments() {
    this.appointmentService.getUserSlots(getCacheData(true, doctorDetails.USER).uuid, moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'))
      .subscribe((res: any) => {
        let appointmentsdata = res.data;
        appointmentsdata.forEach(appointment => {
          if (appointment.status == 'booked') {
            if (appointment.visit) {
              appointment.cheif_complaint = this.getCheifComplaint2(appointment.visit);
              appointment.starts_in = this.checkIfDateOldThanOneDay(appointment.slotJsDate);
              this.appointments.push(appointment);
            }
          }
        });
        this.dataSource1 = new MatTableDataSource(this.appointments);
        this.dataSource1.paginator = this.appointmentPaginator;
        this.dataSource1.filterPredicate = (data: any, filter: string) => data?.openMrsId.toLowerCase().indexOf(filter) != -1 || data?.patientName.toLowerCase().indexOf(filter) != -1;
      });
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

  getCheifComplaint2(visit: any) {
    let recent: any = [];
    const encounters = visit.encounters;
    encounters.forEach(encounter => {
      const display = encounter.type?.name;
      if (display.match(visitTypes.ADULTINITIAL) !== null) {
        const obs = encounter.obs;
        obs.forEach(currentObs => {
          if (currentObs.concept_id == 163212) {
            const currentComplaint = this.visitService.getData2(currentObs)?.value_text.replace(new RegExp('►', 'g'), '').split('<b>');
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
    return moment().diff(birthdate, 'years');
  }

  getVisits() {
    this.appointments = [];
    this.awaitingVisits = [];
    this.inProgressVisits = [];
    this.priorityVisits = [];
    this.visitService.getVisits({ includeInactive: true }).subscribe(
      (response: any) => {
        let visits = response.results;
        visits.forEach((visit: any) => {
          // Check if visit has encounters
          if (visit.encounters.length > 0) {
            /*
              Check if visit has visit attributes, if yes match visit speciality attribute with current doctor specialization
              If no attributes, consider it as General Physician
            */
            if (visit.attributes.length) {
              let flag = 0;
              visit.attributes.forEach((visitAttr: any) => {
                if (visitAttr.attributeType.uuid == "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d") {
                  // If specialization matches process visit
                  if (visitAttr.value == this.specialization) {
                    this.processVisit(visit);
                  }
                }
              });
            } else if (this.specialization == visitTypes.GENERAL_PHYSICIAN) {
              this.processVisit(visit);
            }
          }
        });

        // Check appointments
        this.appointmentService.getUserSlots(getCacheData(true, doctorDetails.USER).uuid, moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'))
          .subscribe((res: any) => {
            let appointmentsdata = res.data;
            appointmentsdata.forEach(appointment => {
              if (appointment.status == 'booked') {
                let matchedVisit = visits.find((v: any) => v.uuid == appointment.visitUuid);
                if (matchedVisit) {
                  matchedVisit.cheif_complaint = this.getCheifComplaint(matchedVisit);
                  appointment.visit_info = matchedVisit;
                  appointment.starts_in = this.checkIfDateOldThanOneDay(appointment.slotJsDate);
                  this.appointments.push(appointment);
                }
              }
            });
            this.dataSource1 = new MatTableDataSource(this.appointments);
            this.dataSource1.paginator = this.appointmentPaginator;
          });
      }
    );
  }

  checkIfEncounterExists(encounters: any, visitType: string) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  processVisit(visit: any) {
    const { encounters } = visit;
    visit.cheif_complaint = this.getCheifComplaint(visit);
    visit.visit_created = (visit.encounters[0].display.includes(visitTypes.FLAGGED)) ? this.getEncounterCreated(visit, visitTypes.FLAGGED) :this.getEncounterCreated(visit, visitTypes.ADULTINITIAL) ;
    if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_COMPLETE) || this.checkIfEncounterExists(encounters, visitTypes.PATIENT_EXIT_SURVEY)) {

    } else if (this.checkIfEncounterExists(encounters, visitTypes.VISIT_NOTE)) {
      visit.prescription_started = this.getEncounterCreated(visit, visitTypes.VISIT_NOTE);
      this.inProgressVisits.push(visit);
    } else if (this.checkIfEncounterExists(encounters, visitTypes.FLAGGED)) {
      this.priorityVisits.push(visit);
    } else if (this.checkIfEncounterExists(encounters, visitTypes.ADULTINITIAL) || this.checkIfEncounterExists(encounters, visitTypes.VITALS)) {
      this.awaitingVisits.push(visit);
    }

    this.dataSource2 = new MatTableDataSource(this.priorityVisits);
    this.dataSource2.paginator = this.priorityPaginator;
    this.dataSource3 = new MatTableDataSource(this.awaitingVisits);
    this.dataSource3.paginator = this.awaitingPaginator;
    this.dataSource4 = new MatTableDataSource(this.inProgressVisits);
    this.dataSource4.paginator = this.inprogressPaginator;
  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment(data).diff(moment(), 'hours');
    let minutes = moment(data).diff(moment(), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm A');
    };
    if (hours < 1) {
      if (minutes < 0) return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`;
      return `${minutes} minutes`;
    }
    return `${hours} hrs`;
  }

  getCreatedAt(data: any) {
    let hours = moment().diff(moment(data), 'hours');
    let minutes = moment().diff(moment(data), 'minutes');
    if (hours > 24) {
      return moment(data).format('DD MMM, YYYY');
    };
    if (hours < 1) {
      return `${minutes} minutes ago`;
    }
    return `${hours} hrs ago`;
  }

  getEncounterCreated(visit: any, encounterName: string) {
    let created_at = '';
    const encounters = visit.encounters;
    encounters.forEach((encounter: any) => {
      const display = encounter.display;
      if (display.match(encounterName) !== null) {
        created_at = this.getCreatedAt(encounter.encounterDatetime);
      }
    });
    return created_at;
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
            const currentComplaint = this.visitService.getData(currentObs)?.value.replace(new RegExp('►', 'g'), '').split('<b>');
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

  getSpecialization(attr: any) {
    let specialization = '';
    attr.forEach((a: any) => {
      if (a.attributeType.uuid == 'ed1715f5-93e2-404e-b3c9-2a2d9600f062' && !a.voided) {
        specialization = a.value;
      }
    });
    return specialization;
  }

  reschedule(appointment: any) {
    const len = appointment.visit.encounters.filter((e: any) => {
      return (e.type.name == visitTypes.PATIENT_EXIT_SURVEY || e.type.name == visitTypes.VISIT_COMPLETE);
    }).length;
    const isCompleted = Boolean(len);
    if (isCompleted) {
      this.toastr.error("Visit is already completed, it can't be rescheduled.", 'Rescheduling failed');
    } else {
      this.coreService.openRescheduleAppointmentModal(appointment).subscribe((res: any) => {
        if (res) {
          let newSlot = res;
          this.coreService.openRescheduleAppointmentConfirmModal({ appointment, newSlot }).subscribe((result: any) => {
            if (result) {
              appointment.appointmentId = appointment.id;
              appointment.slotDate = moment(newSlot.date, "YYYY-MM-DD").format('DD/MM/YYYY');
              appointment.slotTime = newSlot.slot;
              this.appointmentService.rescheduleAppointment(appointment).subscribe((res: any) => {
                const message = res.message;
                if (res.status) {
                  this.getAppointments();
                  this.getAwaitingVisits();
                  this.getPriorityVisits();
                  this.getInProgressVisits();
                  this.toastr.success("The appointment has been rescheduled successfully!", 'Rescheduling successful!');
                } else {
                  this.toastr.success(message, 'Rescheduling failed!');
                }
              });
            }
          })
        }
      });
    }
  }

  cancel(appointment: any) {
    this.coreService.openConfirmCancelAppointmentModal(appointment).subscribe((res: any) => {
      if (res) {
        this.toastr.success("The Appointment has been successfully canceled.", 'Canceling successful');
        this.getAppointments();
        this.getAwaitingVisits();
        this.getPriorityVisits();
        this.getInProgressVisits();
      }
    });
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  playNotify() {
    const audioUrl = "assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource1.filter = filterValue.trim().toLowerCase();
  }

  applyFilter2(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource2.filter = filterValue.trim().toLowerCase();
    this.tempPaginator1.firstPage();
    this.priorityPaginator.firstPage();
  }

  applyFilter3(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource3.filter = filterValue.trim().toLowerCase();
    this.tempPaginator2.firstPage();
    this.awaitingPaginator.firstPage();
  }

  applyFilter4(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource4.filter = filterValue.trim().toLowerCase();
    this.tempPaginator3.firstPage();
    this.inprogressPaginator.firstPage();
  }

  clearFilter(dataSource: string) {
    switch (dataSource) {
      case 'Appointment':
        this.dataSource1.filter = null;
        this.apSearchElement.nativeElement.value = "";
        break;
      case 'Priority':
        this.dataSource2.filter = null;
        this.prSearchElement.nativeElement.value = "";
        break;
      case 'Awaiting':
        this.dataSource3.filter = null;
        this.awSearchElement.nativeElement.value = "";
        break;
      case 'In-progress':
        this.dataSource4.filter = null;
        this.ipSearchElement.nativeElement.value = "";
        break;
      default:
        break;
    }
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

}
