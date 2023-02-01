import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";

@Component({
  selector: "app-time-off-modal",
  templateUrl: "./time-off-modal.component.html",
  styleUrls: ["./time-off-modal.component.scss"],
})
export class TimeOffModalComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;

  @Input() modal: any;

  public modalRef = null;

  selectedFrom: any;
  timeList = ["3:00 pm", "3:30 pm"];

  selectedToTime: any;
  appointments:string;
  followUps:string;
  selectedValue =null;
  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  public openTimeOffModal() {
    this.init();
    this.selectedFrom = this.timeList[0];
    this.selectedToTime = this.timeList[5];

    const options: NgbModalOptions = {
      size: "md",
      windowClass: `time-off-modal-height `,
      centered: true,
    };

    this.modalRef = this.modalSvc.open(this.modalContent, options);
  }


  init() {
    this.appointments =  this.modal?.appointmentTime.join("<br>");
    this.followUps =  this.modal?.FollowUpTime.join("<br>");
    this.timeList= this.getHours();
  }

  getHours(returnAll = true, date?) {
    const hours = Array.from(
      {
        length:21,
      },
      (_, hour) =>
        moment({
          hour,
          minutes: 0,
        }).format("LT").toLocaleLowerCase()
    );
   hours.splice(0, 9);
    if (this.isToday(date) && !returnAll) {
      const hrs = hours.filter((h) => moment(h, "LT").isAfter(moment()));
      return hrs;
    } else {
      return hours;
    }
  }

  isToday(date) {
    const start = moment().startOf("day");
    const end = moment().endOf("day");
    return (
      moment().startOf("day").isSame(moment(date)) ||
      moment(date).isBetween(start, end)
    );
  }
}
