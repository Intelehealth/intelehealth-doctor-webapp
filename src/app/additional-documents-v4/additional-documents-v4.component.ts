import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-additional-documents-v4",
  templateUrl: "./additional-documents-v4.component.html",
  styleUrls: ["./additional-documents-v4.component.scss"],
})
export class AdditionalDocumentsV4Component implements OnInit {
  @Input() pastVisit = false;

  additionalDocuments = {
    data: ["assets/svgs/eyes1.svg", "assets/svgs/eyes2.svg", "abc.pdf"],
  };

  constructor() {}

  ngOnInit(): void {}
}
