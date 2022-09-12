import { Component, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: "app-modalinternetconnection",
  templateUrl: "./modalinternetconnection.component.html",
  styleUrls: ["./modalinternetconnection.component.scss"],
})
export class ModalinternetconnectionComponent implements OnInit {
  constructor(public modal: NgbActiveModal) {}

  ngOnInit(): void {}
}
