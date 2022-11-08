import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-additional-documents-v4",
  templateUrl: "./additional-documents-v4.component.html",
  styleUrls: ["./additional-documents-v4.component.scss"],
})
export class AdditionalDocumentsV4Component implements OnInit {
  AdditionalDocuments = {
    id: "Additional-documents",
    image: "assets/svgs/additional-document.svg",
    mainlable: "Additional documents",
    collapse: "#collapseAdditionalDocuments",
    toggle: "collapse",
    data: ["assets/svgs/eyes1.svg", "assets/svgs/eyes2.svg", "abc.pdf"],
  };

  constructor() {}

  ngOnInit(): void {}
}
