import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatPaginator } from '@angular/material/paginator';
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
  hospitalType: string = '';
  priorityVisitsCount: number = 0;
  awaitingVisitsCount: number = 0;
  inprogressVisitsCount: number = 0;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('appointmentPaginator') appointmentPaginator: MatPaginator;
  @ViewChild('priorityPaginator') priorityPaginator: MatPaginator;
  @ViewChild('awaitingPaginator') awaitingPaginator: MatPaginator;
  @ViewChild('inprogressPaginator') inprogressPaginator: MatPaginator;


  constructor(
    private pageTitleService: PageTitleService,
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private socket: SocketService,
    private router: Router,
    private coreService: CoreService,
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "Dashboard", imgUrl: "assets/svgs/menu-info-circle.svg" });
    let provider = JSON.parse(localStorage.getItem('provider'));
    if (provider) {
      if (provider.attributes.length) {
        this.specialization = this.getSpecialization(provider.attributes);
        this.hospitalType = this.getHospitalType(provider.attributes);
      } else {
        this.router.navigate(['/dashboard/get-started']);
      }
      // this.getAppointments();
      this.getVisits();
      // this.getVisitCounts(this.specialization);
    }


    this.socket.initSocket(true);
    this.socket.onEvent("updateMessage").subscribe((data) => {
      this.socket.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });
      this.playNotify();
    });
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
              Check if visit has visit attributes, if yes match visit speciality attribute with current doctor specialization and hospital Type
              If no attributes, consider it as General Physician
            */
           if (visit.attributes.length) {
              const visitSpeciality   =  visit.attributes.find((attr: any) => attr.attributeType.uuid == "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d");
              const visitHospitalType =  visit.attributes.find((attr: any) => attr.attributeType.uuid == "f288fc8f-428a-4665-a1bd-7b08e64d66e1");
              // visit.attributes.forEach((visitAttr: any) => {
              //   if (visitAttr.attributeType.uuid == "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d") {
              //     // If specialization matches process visit
              //     if (visitAttr.value == this.specialization) {
              //       this.processVisit(visit);
              //     }
              //   }
              // });
              if (visitSpeciality && visitHospitalType) {
                // If specialization and hospital type matches process visit
                if (visitSpeciality.value == this.specialization && visitHospitalType.value == this.hospitalType) {
                  this.processVisit(visit);
                }
              }
            }
            // else if(this.specialization == 'General Physician') {
            //   this.processVisit(visit);
            // }
          }
        });

        // Check appointments
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
    visit.visit_created = this.getEncounterCreated(visit, 'ADULTINITIAL');
    if (this.checkIfEncounterExists(encounters, 'Visit Complete') || this.checkIfEncounterExists(encounters, 'Patient Exit Survey')) {

    } else if (this.checkIfEncounterExists(encounters, 'Remote Prescription')) {

    } else if (this.checkIfEncounterExists(encounters, 'Visit Note')) {
      visit.prescription_started = this.getEncounterCreated(visit, 'Visit Note');
      this.inProgressVisits.push(visit);
    } else if (this.checkIfEncounterExists(encounters, 'Flagged')) {
      this.priorityVisits.push(visit);
    } else if (this.checkIfEncounterExists(encounters, 'ADULTINITIAL') || this.checkIfEncounterExists(encounters, 'Vitals')) {
      this.awaitingVisits.push(visit);
    }

    this.dataSource2 = new MatTableDataSource(this.priorityVisits);
    this.dataSource2.paginator = this.priorityPaginator;
    this.dataSource3 = new MatTableDataSource(this.awaitingVisits);
    this.dataSource3.paginator = this.awaitingPaginator;
    this.dataSource4 = new MatTableDataSource(this.inProgressVisits);
    this.dataSource4.paginator = this.inprogressPaginator;
  }

  // getVisitCounts(specialization: string) {
  //   const getTotal = (data, type) => {
  //     const item = data.find(({ Status }: any) => Status === type);
  //     return item?.Total || 0;
  //   };
  //   this.visitService.getVisitCounts(specialization).subscribe(({ data }: any) => {
  //     if (data.length) {
  //       this.inprogressVisitsCount = getTotal(data, "Visit In Progress");
  //       this.priorityVisitsCount = getTotal(data, "Priority");
  //       this.awaitingVisitsCount = getTotal(data, "Awaiting Consult");
  //     }
  //   });
  // }

  // getAppointments() {
  //   this.visitService.getVisits({ includeInactive: false }).subscribe((res: any) =>{
  //     if (res) {
  //       let visits = res.results;
  //       this.appointmentService.getUserSlots(JSON.parse(localStorage.user).uuid, moment().startOf('year').format('MM/DD/YYYY') ,moment().endOf('year').format('MM/DD/YYYY'))
  //       .subscribe((res: any) => {
  //         let appointmentsdata = res.data;
  //         appointmentsdata.forEach(appointment => {
  //           if (appointment.status == 'booked') {
  //             let matchedVisit = visits.find((v: any) => v.uuid == appointment.visitUuid);
  //             if (matchedVisit) {
  //               matchedVisit.cheif_complaint = this.getCheifComplaint(matchedVisit);
  //             }
  //             appointment.visit_info = matchedVisit;
  //             appointment.starts_in = this.checkIfDateOldThanOneDay(appointment.slotJsDate);
  //             this.appointments.push(appointment);
  //           }
  //         });
  //         this.dataSource1 = new MatTableDataSource(this.appointments);
  //         this.dataSource1.paginator = this.appointmentPaginator;
  //       });
  //     }
  //   });
  // }

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

  reschedule(appointment: any) {
    const len = appointment.visit_info.encounters.filter((e: any) => {
      return (e.display.includes("Patient Exit Survey") || e.display.includes("Visit Complete"));
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
                  this.getVisits();
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
        this.getVisits();
      }
    });
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

}
