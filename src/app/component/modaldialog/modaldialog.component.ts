import { Component, OnInit, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-modaldialog",
  templateUrl: "./modaldialog.component.html",
  styleUrls: ["./modaldialog.component.scss"],
})
export class ModaldialogComponent implements OnInit {
  @Input() public title: string = "";
  @Input() public btnname: string = "";
  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {}
}
