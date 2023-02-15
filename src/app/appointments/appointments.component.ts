import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { environment } from 'src/environments/environment';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AppointmentService } from '../services/appointment.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { CoreService } from '../services/core/core.service';
import { ToastrService } from 'ngx-toastr';

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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  constructor(
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private pageTitleService: PageTitleService,
    private coreService: CoreService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Appointments", imgUrl: "assets/svgs/menu-video-circle.svg" });
    this.getVisits();
  }

  // getAppointements() {
  //   this.appointmentService
  //     .getUserSlots(JSON.parse(localStorage.user).uuid,'01/01/2022','31/12/2022')
  //     .subscribe({
  //       next: (res: any) => {
  //         console.log(res);
  //       },
  //     });
  // }

  getVisits() {
    this.appointments = [];
    this.visitService.getVisits({ includeInactive: true }).subscribe((res: any) =>{
      if (res) {
        let visits = res.results;
        this.appointmentService.getUserSlots(JSON.parse(localStorage.user).uuid, moment().startOf('year').format('DD/MM/YYYY') ,moment().endOf('year').format('DD/MM/YYYY'))
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
    console.log(hours, minutes);
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

  reschedule() {
    console.log("Clicked: Reschedule");
  }

  cancel(appointment: any) {
    this.coreService.openConfirmCancelAppointmentModal(appointment).subscribe((res: any) => {
      if (res) {
        this.toastr.success("The Appointment has been successfully canceled.", 'Canceling successful');
        this.getVisits();
      }
    });
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

}
