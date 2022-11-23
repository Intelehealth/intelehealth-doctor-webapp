import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

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
    morning: [
      "9:00 am",
      "9:30 am",
      "10:00 am",
      "10:30 am",
      "11:00 am",
      "11:30 am",
    ],
    afternoon: [
      "12:00 pm",
      "12:30 pm",
      "1:00 pm",
      "1:30 pm",
      "2:00 pm",
      "2:30 pm",
      "3:00 pm",
      "3:30 pm",
      "4:00 pm",
      "4:30 pm",
    ],
    evening: ["5:00 am", "5:30 am", "6:00 am", "6:30 am", "7:00 am", "7:30 am"],
  };

  constructor(public modalSvc: NgbModal) {}

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
    this.activeSlot = "9:30 am";
  }
}
