import { Component, OnInit } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';
import { setHours, setMinutes } from 'date-fns';
import { PageTitleService } from '../core/page-title/page-title.service';
import { AppointmentService } from '../services/appointment.service';
import { VisitService } from '../services/visit.service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { CoreService } from '../services/core/core.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  viewDate = new Date();
  view: CalendarView = CalendarView.Day;
  CalendarView = CalendarView;
  events: CalendarEvent[] = [];
  baseUrl: string = environment.baseURL;
  base: string = environment.base;
  provider: any;
  user: any;
  fetchedYears: number[] = [];
  fetchedMonths: string[] = [];
  daysOff: any[] = [];
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  selectedReason = "";
  otherReason = "";
  reasons = ["Doctor Not Available", "Patient Not Available", "Other"];
  lang = localStorage.getItem('selectedLanguage');
  constructor(
    private pageTitleService: PageTitleService,
    private appointmentService: AppointmentService,
    private visitService: VisitService,
    private coreService: CoreService,
    private router: Router,
    private toastr: ToastrService,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: "", imgUrl: "assets/svgs/menu-calendar-circle.svg" });
    this.user = JSON.parse(localStorage.getItem('user'));
    this.provider = JSON.parse(localStorage.getItem('provider'));
    this.fetchedYears.push(new Date().getFullYear());
    this.fetchedMonths.push(`${moment(new Date()).format("MMMM")} ${moment(new Date()).format("YYYY")}`);
    // this.getFollowUpVisit();
    this.getAppointments(moment().startOf('year').format('DD/MM/YYYY'), moment().endOf('year').format('DD/MM/YYYY'));
    this.getSchedule();
    // moment.locale(localStorage.getItem('selectedLanguage'));
  }

  dateChanged(viewDate: Date) {
    if (this.fetchedYears.indexOf(viewDate.getFullYear()) == -1) {
      this.fetchedYears.push(viewDate.getFullYear());
      this.getAppointments(moment(viewDate).startOf('year').format('DD/MM/YYYY'), moment(viewDate).endOf('year').format('DD/MM/YYYY'));
    }
    if (this.fetchedMonths.indexOf(`${moment(viewDate).format("MMMM")} ${moment(viewDate).format("YYYY")}`) == -1) {
      this.fetchedMonths.push(`${moment(viewDate).format("MMMM")} ${moment(viewDate).format("YYYY")}`);
      this.getSchedule(moment(viewDate).format("YYYY"), moment(viewDate).format("MMMM"));
    }
  }

  getAppointments(from: any, to: any) {
    this.appointmentService.getUserSlots(JSON.parse(localStorage.user).uuid, from, to)
      .subscribe((res: any) => {
        let appointmentsdata = res.data;
        appointmentsdata.forEach((appointment: any) => {
          // if (!_.find(this.events, { id: appointment.visitUuid, title: 'Appointment', meta: { id: appointment.id } })) {
          if (!this.events.find((o: any) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id)) {
            this.events.push({
              id: appointment.visitUuid,
              title: 'Appointment',
              start: moment(appointment.slotJsDate).toDate(),
              end: moment(appointment.slotJsDate).add(appointment.slotDuration, appointment.slotDurationUnit).toDate(),
              meta: appointment
            });
          }
        });
    });
  }

  getSchedule(year = moment(new Date()).format("YYYY"), month = moment(new Date()).format("MMMM")) {
    this.appointmentService.getUserAppoitment(this.userId, year, month)
      .subscribe({
        next: (res: any) => {
          if (res && res.data) {
            if (!res.data.daysOff) {
              res.data.daysOff = [];
            }
            this.daysOff.push(res.data);
          } else {
            this.daysOff.push({
              type: "month",
              month: month,
              year: year,
              daysOff: [],
              slotSchedule: [],
              startDate: moment(`${month} ${year}`, "MMMM yyyy").startOf('month').add(1, 'day').toISOString(),
              endDate: moment(`${month} ${year}`, "MMMM yyyy").endOf('month').toISOString(),
              drName: this.drName,
              userUuid: this.userId,
              speciality: this.getSpeciality(),
              slotDays: ""
            });
          }
        },
      });
  }

  // getFollowUpVisit() {
  //   this.appointmentService.getFollowUpVisit(this.providerId).subscribe({
  //     next: (res: any) => {
  //       if(res) {
  //         let followUpVisits = res;
  //         followUpVisits.forEach((folloUp: any) => {
  //           this.visitService.fetchVisitDetails(folloUp.visit_id).subscribe((visit)=> {
  //             let followUpDate = (folloUp.followup_text.includes('Time:')) ? moment(folloUp.followup_text.split(', Time: ')[0]).format('YYYY-MM-DD') : moment(folloUp.followup_text.split(', Remark: ')[0]).format('YYYY-MM-DD');
  //             let followUpTime = (folloUp.followup_text.includes('Time:')) ? folloUp.followup_text.split(', Time: ')[1].split(', Remark: ')[0] : null;
  //             let start = (followUpTime)?  moment(followUpDate + ' ' + followUpTime, 'YYYY-MM-DD hh:mm a').toDate() : setHours(setMinutes(new Date(followUpDate), 0), 9);
  //             let end = (followUpTime)?  moment(followUpDate + ' ' + followUpTime, 'YYYY-MM-DD hh:mm a').add(30, 'minutes').toDate() : setHours(setMinutes(new Date(followUpDate), 30), 9);
  //             if (moment(start).isValid() && moment(end).isValid()) {
  //               let hw = this.getHW(visit.encounters);
  //               this.events.push({
  //                 id: visit.uuid,
  //                 title: 'Follow-up visit',
  //                 start,
  //                 end,
  //                 meta: {
  //                   createdAt: this.getCreatedAtTime(visit.encounters),
  //                   // createdBy: "612322d6-8b80-4027-af3a-c2805bd32007",
  //                   drName: this.provider?.person.display,
  //                   hwAge: hw.hwAge,
  //                   hwGender: hw.hwGender,
  //                   hwName: hw.hwName,
  //                   hwPic: null,
  //                   hwUUID: hw.hwProviderUuid,
  //                   // id: 3,
  //                   // locationUuid: "eb374eaf-430e-465e-81df-fe94c2c515be",
  //                   openMrsId: visit.patient.identifiers[0].identifier,
  //                   patientAge: visit.patient.person.age,
  //                   patientGender: visit.patient.person.gender,
  //                   patientId: visit.patient.uuid,
  //                   patientName: visit.patient.person.display,
  //                   patientPic: null,
  //                   // reason: null,
  //                   slotDate: moment(followUpDate).format('DD/MM/YYYY'),
  //                   slotDay: moment(followUpDate).format('dddd'),
  //                   slotDuration: 30,
  //                   slotDurationUnit: "minutes",
  //                   slotJsDate: moment(start).utc().format(),
  //                   slotTime: (followUpTime)?followUpTime:"9:00 AM",
  //                   // speciality: "General Physician",
  //                   // status: "booked",
  //                   type: "follow-up visit",
  //                   // updatedAt: "2023-02-13T11:49:25.000Z",
  //                   // updatedBy: null,
  //                   userUuid: this.user.uuid,
  //                   visitUuid: visit.uuid,
  //                   visit_info: visit
  //                 }
  //               });
  //             }
  //           })
  //         });
  //       }
  //     },
  //   });
  // }

  getCreatedAtTime(encounters: any) {
    let encounterDateTime = '';
    encounters.forEach((encounter: any) => {
      const display = encounter.display;
      if (display.match('Visit Note') !== null) {
        encounterDateTime = encounter.encounterDatetime;
      }
    });
    return encounterDateTime;
  }

  getHW(encounters: any) {
    let obj: any = {
      hwName: null,
      hwAge: null,
      hwGender: null,
      hwProviderUuid: null
    };
    encounters.forEach((encounter: any) => {
      const display = encounter.display;
      if (display.match('ADULTINITIAL') !== null) {
        obj.hwName = encounter.encounterProviders[0].provider.person.display;
        obj.hwAge = encounter.encounterProviders[0].provider.person.age;
        obj.hwGender = encounter.encounterProviders[0].provider.person.gender;
        obj.hwProviderUuid = encounter.encounterProviders[0].provider.uuid;
      }
    });
    return obj;
  }

  get providerId() {
    return JSON.parse(localStorage.provider).uuid;
  }

  private get userId() {
    return JSON.parse(localStorage.user).uuid;
  }

  private get drName() {
    return (
      JSON.parse(localStorage.user)?.person?.display ||
      JSON.parse(localStorage.user)?.display
    );
  }

  private getSpeciality() {
    return JSON.parse(localStorage.provider).attributes.find((a: any) =>
      a.display.includes("specialization")
    ).value;
  }

  onTabChanged(event: number) {
    switch (event) {
      case 0:
        this.setView(CalendarView.Day);
        break;
      case 1:
        this.setView(CalendarView.Week);
        break;
      case 2:
        this.setView(CalendarView.Month);
        break;
    }
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  getCount(type: string, events: any) {
    let count = 0;
    events.forEach((e: any) => {
      if (e.title == type) {
        count++;
      }
    });
    return count;
  }

  hourSegmentClicked(hourSegment: any) {
    console.log(hourSegment);
  }

  dayClicked(view: any, day: any) {
    // console.log(day);
    if (view == 'monthView') {
      // let oldDaysOff = _.find(this.daysOff, { month: this.monthNames[day.date.getMonth()], year: day.date.getFullYear().toString() });
      let oldDaysOff = this.daysOff.find((o: any) => o.month == this.monthNames[day.date.getMonth()] && o.year == day.date.getFullYear().toString());
      this.coreService.openAppointmentDetailMonthViewModal(day).subscribe((res: any) => {
        // console.log(res);
      });
      // if (oldDaysOff) {
      //   if (oldDaysOff.daysOff.indexOf(moment(day.date).format('DD/MM/YYYY')) != -1) {
      //     this.toastr.warning(this.translateService.instant(`messages.${"This day is already marked as Day Off"}`), this.translateService.instant(`messages.${"Already DayOff"}`));
      //     return;
      //   }
      // }
      // this.coreService.openAppointmentDetailMonthViewModal(day).subscribe((res: any) => {
      //   if (res) {
      //     switch (res.markAs) {
      //       case 'dayOff':
      //         this.coreService.openConfirmDayOffModal(day.date).subscribe((result: any) => {
      //           if (result) {
      //             let body = {
      //               userUuid: this.userId,
      //               daysOff: (oldDaysOff)? oldDaysOff.daysOff.concat([moment(day.date).format('DD/MM/YYYY')]) : [moment(day.date).format('DD/MM/YYYY')],
      //               month: this.monthNames[day.date.getMonth()],
      //               year: day.date.getFullYear().toString()
      //             };
      //             this.appointmentService.updateDaysOff(body).subscribe({
      //               next: (res: any) => {
      //                 if (res.status) {
      //                   // let index = _.findIndex(this.daysOff, { month: this.monthNames[day.date.getMonth()], year: day.date.getFullYear().toString() });
      //                   let index = this.daysOff.findIndex((o: any) => o.month == this.monthNames[day.date.getMonth()] && o.year == day.date.getFullYear().toString());
      //                   if (index != -1) {
      //                     this.daysOff[index].daysOff = (this.daysOff[index].daysOff)?this.daysOff[index].daysOff.concat(moment(day.date).format('DD/MM/YYYY')): [moment(day.date).format('DD/MM/YYYY')];
      //                   }
      //                   // else {
      //                   //   this.daysOff.push({
      //                   //     type: "month",
      //                   //     month: res.data.month,
      //                   //     year: res.data.year,
      //                   //     slotSchedule: [],
      //                   //     startDate: moment(day.date).startOf('month').toISOString(),
      //                   //     endDate: moment(day.date).endOf('month').toISOString(),
      //                   //     drName: this.drName,
      //                   //     userUuid: this.userId,
      //                   //     speciality: this.getSpeciality(),
      //                   //     daysOff: [moment(day.date).format('DD/MM/YYYY')],
      //                   //     slotDays: ""
      //                   //   });
      //                   // }
      //                   day.events.forEach((event: any) => {
      //                     if (event.title == 'Appointment') {
      //                       this.cancel(event.meta, false);
      //                     }
      //                   });

      //                   // Update schedule as per new dayOff
      //                   // let schedule = _.find(this.daysOff, { month: this.monthNames[day.date.getMonth()], year: day.date.getFullYear().toString() });
      //                   let schedule = this.daysOff.find((o: any) => o.month == this.monthNames[day.date.getMonth()] && o.year == day.date.getFullYear().toString());
      //                   if (schedule?.slotSchedule.length) {
      //                     // schedule.slotSchedule = _.filter(schedule.slotSchedule, (s) => { return !moment(day.date).isSame(moment(s.date)) });
      //                     schedule.slotSchedule = schedule.slotSchedule.filter((s: any) => { return !moment(day.date).isSame(moment(s.date)) });
      //                     this.appointmentService.updateOrCreateAppointment(schedule).subscribe({
      //                       next: (res: any) => {
      //                         if (res.status) {
      //                           this.daysOff[index] = schedule;
      //                         }
      //                       },
      //                     });
      //                   }
      //                 }
      //               },
      //             });
      //           }
      //         });
      //         break;
      //       case 'hoursOff':
      //         this.coreService.openConfirmHoursOffModal({ day: day.date, detail: res}).subscribe((result: any) => {
      //           if (result) {
      //             day.events.forEach((event: any) => {
      //               if (event.title == 'Appointment') {
      //                 if (moment(event.meta.slotTime,'LT').isBetween(moment(res.from, 'LT'), moment(res.to, 'LT'))) {
      //                   this.cancel(event.meta, false);
      //                 }
      //               }
      //             });
      //           }
      //         });
      //         break;
      //     }
      //   }
      // });
    }
  }

  handleEvent(view: any, event: any) {
    // console.log(view, event);
    if (view == 'dayView' || view == 'weekView') {
      // if (event.title == 'Appointment') {
        this.coreService.openAppointmentDetailDayViewModal(event).subscribe((res: any) => {
          if (res) {
            switch (res) {
              case 'view':
                this.router.navigate(['/dashboard/visit-summary', event.id]);
                break;
              case 'reschedule':
                this.reschedule(event.meta);
                break;
              case 'cancel':
                this.cancel(event.meta);
                break;
            }
          }
        });
      // }
    }
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }

  cancel(appointment: any, withConfirmation: boolean = true) {
    if (withConfirmation) {
      this.coreService.openConfirmCancelAppointmentModal(appointment).subscribe((res: any) => {
        if (res) {
          // this.events = _.reject(this.events, { id: appointment.visitUuid, title: 'Appointment', meta: { id: appointment.id } });
          this.events = this.events.splice(this.events.findIndex((o: any) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id), 1);
          this.toastr.success(this.translateService.instant(`messages.${"The Appointment has been successfully canceled."}`), this.translateService.instant(`messages.${"Canceling successful"}`));
        }
      });
    } else {
      const payload = {
        id: appointment.id,
        visitUuid: appointment.visitUuid,
        hwUUID: this.userId,
      };
      this.appointmentService.cancelAppointment(payload).subscribe((res: any) => {
          if(res) {
            if (res.status) {
              // this.events = _.reject(this.events, { id: appointment.visitUuid, title: 'Appointment', meta: { id: appointment.id } });
              this.events = this.events.splice(this.events.findIndex((o: any) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id), 1);
            }
          }
      });
    }
  }

  get reason() {
    let reason;
    if (this.selectedReason === this.reasons[2]) reason = this.otherReason;
    else reason = this.selectedReason;
    return reason;
  }

  reschedule(appointment: any) {
    const len = appointment.visit_info.encounters.filter((e: any) => {
      return (e.display.includes("Patient Exit Survey") || e.display.includes("Visit Complete"));
    }).length;
    const isCompleted = Boolean(len);
    if (isCompleted) {
      this.toastr.error(this.translateService.instant(`messages.${"Visit is already completed, it can't be rescheduled."}`), this.translateService.instant(`messages.${"Rescheduling failed"}`));
    } else {
      this.coreService.openRescheduleAppointmentModal(appointment).subscribe((res: any) => {
        if (res) {
          let newSlot = res;
          this.coreService.openRescheduleAppointmentConfirmModal({ appointment, newSlot }).subscribe((result: any) => {
            if (result) {
              appointment.appointmentId = appointment.id;
              appointment.slotDate = moment(newSlot.date, "YYYY-MM-DD").format('DD/MM/YYYY');
              appointment.slotTime = newSlot.slot;
              appointment.reason = this.reason;
              delete appointment["visit_info"];
              this.appointmentService.rescheduleAppointment(appointment).subscribe((res: any) => {
                const message = res.message;
                if (res.status) {
                  // this.events = _.reject(this.events, { id: appointment.visitUuid, title: 'Appointment', meta: { id: appointment.id } });
                  this.events = this.events.splice(this.events.findIndex((o: any) => o.id == appointment.visitUuid && o.title == 'Appointment' && o.meta?.id == appointment.id), 1);
                  this.events.push({
                    id: appointment.visitUuid,
                    title: 'Appointment',
                    start: moment(res.data.slotJsDate).toDate(),
                    end: moment(res.data.slotJsDate).add(res.data.slotDuration, res.data.slotDurationUnit).toDate(),
                    meta: res.data
                  });
                  this.toastr.success(this.translateService.instant(`messages.${"The appointment has been rescheduled successfully!"}`), this.translateService.instant(`messages.${"Rescheduling successful!"}`));
                } else {
                  this.toastr.success(this.translateService.instant(message), this.translateService.instant(`messages.${"Rescheduling failed!"}`));
                }
              });
            }
          });
        }
      });
    }
  }

  checkIfDayOff(date: Date) {
    // let oldDaysOff = _.find(this.daysOff, { month: this.monthNames[date.getMonth()], year: date.getFullYear().toString() });
    let oldDaysOff = this.daysOff.find((o: any) => o.month == this.monthNames[date.getMonth()] && o.year == date.getFullYear().toString());
    if (oldDaysOff && oldDaysOff?.daysOff) {
      if (oldDaysOff.daysOff.indexOf(moment(date).format('DD/MM/YYYY')) != -1) {
        return true;
      }
    }
    return false;
  }
}
