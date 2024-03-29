import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AppointmentService } from '../services/appointment.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { CoreService } from '../services/core/core.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData } from '../utils/utility-functions';
import { doctorDetails, languages, visitTypes } from 'src/config/constant';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {

  items = ["Appointments"];
  expandedIndex = 0;
  displayedColumns: string[] = ['name', 'age', 'starts_in', 'location', 'cheif_complaint', 'actions'];
  dataSource = new MatTableDataSource<any>();
  baseUrl: string = environment.baseURL;
  isLoaded: boolean = false;
  appointments: any = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('searchInput', { static: true }) searchElement: ElementRef;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private pageTitleService: PageTitleService,
    private coreService: CoreService,
    private toastr: ToastrService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Appointments", imgUrl: "assets/svgs/menu-video-circle.svg" });
    this.getAppointments();
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
        this.dataSource = new MatTableDataSource(this.appointments);
        this.dataSource.paginator = this.paginator;
        this.dataSource.filterPredicate = (data: any, filter: string) => data?.openMrsId.toLowerCase().indexOf(filter) != -1 || data?.patientName.toLowerCase().indexOf(filter) != -1;
      });
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

  getVisits() {
    this.appointments = [];
    this.visitService.getVisits({ includeInactive: true }).subscribe((res: any) =>{
      if (res) {
        let visits = res.results;
        this.appointmentService.getUserSlots(getCacheData(true, doctorDetails.USER).uuid, moment().startOf('year').format('DD/MM/YYYY') ,moment().endOf('year').format('DD/MM/YYYY'))
        .subscribe((res: any) => {
          let appointmentsdata = res.data;
          appointmentsdata.forEach((appointment: any) => {
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
          this.dataSource = new MatTableDataSource(this.appointments);
          this.dataSource.paginator = this.paginator;
          this.isLoaded = true;
        });
      }
    });
  }

  checkIfDateOldThanOneDay(data: any) {
    let hours = moment(data).diff(moment(), 'hours');
    let minutes = moment(data).diff(moment(), 'minutes');
    if(hours > 24) {
      return moment(data).format('DD MMM, YYYY hh:mm A');
    };
    if (hours < 1) {
      if(minutes < 0) return `Due : ${moment(data).format('DD MMM, YYYY hh:mm A')}`;
      return `${minutes} minutes`;
    }
    return `${hours} hrs`;
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
            const currentComplaint = this.visitService.getData(obs)?.value.replace(new RegExp('►', 'g'),'').split('<b>');
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

  reschedule(appointment: any) {
    const len = appointment.visit.encounters.filter((e: any) => {
      return (e.type.name == visitTypes.PATIENT_EXIT_SURVEY || e.type.name == visitTypes.VISIT_COMPLETE);
    }).length;
    const isCompleted = Boolean(len);
    if (isCompleted) {
      this.toastr.error(this.translateService.instant("Visit is already completed, it can't be rescheduled."), this.translateService.instant('Rescheduling failed!'));
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
                  this.getVisits();
                  this.toastr.success(this.translateService.instant("The appointment has been rescheduled successfully!"), this.translateService.instant('Rescheduling successful!'));
                } else {
                  this.toastr.success(message, this.translateService.instant('Rescheduling failed!'));
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
        this.toastr.success(this.translateService.instant('The Appointment has been successfully canceled.'),this.translateService.instant('Canceling successful'));
        this.getVisits();
      }
    });
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  get userId() {
    return getCacheData(true, doctorDetails.USER).uuid;
  }

  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  clearFilter() {
    this.dataSource.filter = null;
    this.searchElement.nativeElement.value = "";
  }

}
