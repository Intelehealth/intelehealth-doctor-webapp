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

  isShowVisitSummary: boolean;

  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  public openVisitSummaryModal(isShowVisitSummary: boolean = true) {
    this.isShowVisitSummary = isShowVisitSummary;

    const options: NgbModalOptions = {
      size: "xl",
      centered: true,
    };

    this.modalRef = this.modalSvc.open(this.modalContent, options);

    /**
     * Getting scroller in center, putting it to top
     */
    setTimeout(() => {
      this.modalRef?._windowCmptRef?.location?.nativeElement?.scroll(0, 0);
    }, 0);
  }

  colseVisitSummaryModal(){
    this.modalRef.close();
  }
}
