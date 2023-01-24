import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import { AppointmentService } from "src/app/services/appointment.service";

@Component({
  selector: "app-reschedule-appointment-modal",
  templateUrl: "./reschedule-appointment-modal.component.html",
  styleUrls: ["./reschedule-appointment-modal.component.scss"],
})
export class RescheduleAppointmentModalComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  
  @Input() modal: any;
  
  public modalRef = null;
  activeSlot: any = null;
  /**
   * @todo while implementation fetch this data from API directly in this component in Init method
   */
  scheduleData: any = {
    morning: [],
    afternoon: [],
    evening: []
  };
  minDate = moment().format("YYYY-MM-DD");
  todaysDate = moment().format("YYYY-MM-DD");
  slots = [];
  constructor(public modalSvc: NgbModal,
    private appointmentService: AppointmentService) {}

  ngOnInit(): void {}

  public openRescheduleTimeSlotsModal() {
    this.init();

    const options: NgbModalOptions = {
      size: "md",
      windowClass: `reschedule-time-slot-modal`,
      centered: true,
    };
    this.modalRef = this.modalSvc.open(this.modalContent, options);
  }

  init() {
    //this.activeSlot = this.modal?.data?.startTime;
    this.getAppointmentSlots();
  }

  changeCalender(e) {
    this.todaysDate = e.target.value;
    this.activeSlot = null;
    this.getAppointmentSlots();
  }

  getAppointmentSlots(
    fromDate = this.todaysDate,
    toDate = this.todaysDate,
    speciality = this.modal?.data?.speciality
  ) {
    this.scheduleData = {
      morning: [],
      afternoon: [],
      evening: []};
    this.appointmentService
      .getAppointmentSlots(
        moment(fromDate).format("DD/MM/YYYY"),
        moment(toDate).format("DD/MM/YYYY"),
        speciality
      )
      .subscribe((res: any) => {
        this.slots = res.dates;
        this.slots.forEach(slot => {
          if(moment(slot.slotTime, "LT").isBefore(moment("12:00 PM", "LT"))){
            this.scheduleData.morning.push(slot.slotTime);
          } else  if(moment(slot.slotTime, "LT").isBetween(moment("11:30 AM", "LT"), moment("5:00 PM", "LT"))){
            this.scheduleData.afternoon.push(slot.slotTime);
          } else {
            this.scheduleData.evening.push(slot.slotTime);
          }

        })
      });
  }
}
