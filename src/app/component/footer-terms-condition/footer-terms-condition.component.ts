import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-footer-terms-condition",
  templateUrl: "./footer-terms-condition.component.html",
  styleUrls: ["./footer-terms-condition.component.scss"],
})
export class FooterTermsConditionComponent implements OnInit {
  @Input() showTermsAndCondition: boolean = false;

  constructor() {}

  ngOnInit(): void {}
}
