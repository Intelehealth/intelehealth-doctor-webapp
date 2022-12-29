import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AppointmentService } from 'src/app/services/appointment.service';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-appointment-container',
  templateUrl: './appointment-container.component.html',
  styleUrls: ['./appointment-container.component.scss']
})
export class AppointmentContainerComponent implements OnInit {

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

  constructor(private appointmentService: AppointmentService, private visitService: VisitService) { }

  ngOnInit(): void {
    this.getVisits();
  }

  getAppointements() {
    this.appointmentService
      .getUserSlots(JSON.parse(localStorage.user).uuid,'01/01/2022','31/12/2022')
      .subscribe({
        next: (res: any) => {
          console.log(res);
        },
      });
  }

  getVisits() {
    this.visitService.getVisits({ includeInactive: false }).subscribe((res: any) =>{
      if (res) {
        let visits = res.results;
        this.appointmentService.getUserSlots(JSON.parse(localStorage.user).uuid, moment().startOf('year').format('MM/DD/YYYY') ,moment().endOf('year').format('MM/DD/YYYY'))
        .subscribe((res: any) => {
          let appointmentsdata = res.data;
          appointmentsdata.forEach(appointment => {
            if (appointment.status == 'booked') {
              let matchedVisit = visits.find((v: any) => v.uuid == appointment.visitUuid);
              if (matchedVisit) {
                matchedVisit.cheif_complaint = this.getCheifComplaint(matchedVisit);
              }
              appointment.visit_info = matchedVisit;
              appointment.starts_in = this.checkIfDateOldThanOneDay(appointment.slotJsDate);
              this.appointments.push(appointment);
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

  cancel() {
    console.log("Clicked: Cancel");
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }
}
