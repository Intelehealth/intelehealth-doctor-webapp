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
  public modalRef = null;

  @Input() modal: any;

  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  public openTimeOffModal() {
    const options: NgbModalOptions = {
      size: "md",
      windowClass: `time-off-modal-height `,
      centered: true,
    };

    this.modalRef = this.modalSvc.open(this.modalContent, options);
  }
}
