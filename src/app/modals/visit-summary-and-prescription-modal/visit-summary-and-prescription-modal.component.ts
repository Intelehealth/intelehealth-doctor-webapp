import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-visit-summary-and-prescription-modal",
  templateUrl: "./visit-summary-and-prescription-modal.component.html",
  styleUrls: ["./visit-summary-and-prescription-modal.component.scss"],
})
export class VisitSummaryAndPrescriptionModalComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;

  public modalRef = null;

  @Input() modal: any;

  isShowVisitSummary: boolean = true;

  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  public openVisitSummaryModal() {
    const options: NgbModalOptions = {
      size: "xl",
      centered: true,
    };

    this.modalRef = this.modalSvc.open(this.modalContent, options);
  }
}
