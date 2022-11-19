import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-appointment-detail-modal",
  templateUrl: "./appointment-detail-modal.component.html",
  styleUrls: ["./appointment-detail-modal.component.scss"],
})
export class AppointmentDetailModalComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  public modalRef = null;

  @Input() modal: any;

  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  public openAppointmentModal() {
    const options: NgbModalOptions = {
      size: "md",
      windowClass: ``,
      centered: true,
    };

    this.modalRef = this.modalSvc.open(this.modalContent, options);
  }
}
