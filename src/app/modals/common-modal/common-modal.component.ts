import {
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { NgbModal, NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-common-modal",
  templateUrl: "./common-modal.component.html",
  styleUrls: ["./common-modal.component.scss"],
})
export class CommonModalComponent implements OnInit {
  @ViewChild("modalContent") modalContent: TemplateRef<any>;
  public modalRef = null;

  @Input() modal: any;

  constructor(public modalSvc: NgbModal) {}

  ngOnInit(): void {}

  public openModal() {
    const options: NgbModalOptions = {
      size: "md",
      windowClass: `common-dialog-modal ${this.modal.windowClass}`,
      centered: true,
    };

    this.modalRef = this.modalSvc.open(this.modalContent, options);
  }
}
