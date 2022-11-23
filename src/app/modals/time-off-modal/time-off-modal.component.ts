import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

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
  fromTimeList = ["3:00 pm", "3:30 pm"];

  selectedToTime: any;
  toTimeList = ["7:00 pm", "7:30 pm"];

  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  public openTimeOffModal() {
    this.selectedFrom = this.fromTimeList[0];
    this.selectedToTime = this.toTimeList[0];

    const options: NgbModalOptions = {
      size: "md",
      windowClass: `time-off-modal-height `,
      centered: true,
    };

    this.modalRef = this.modalSvc.open(this.modalContent, options);
  }
}
