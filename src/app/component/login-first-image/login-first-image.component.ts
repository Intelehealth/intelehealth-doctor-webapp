import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-login-first-image",
  templateUrl: "./login-first-image.component.html",
  styleUrls: ["./login-first-image.component.scss"],
})
export class LoginFirstImageComponent implements OnInit {
  @Input() heartbeat1 = "";
  @Input() heartbeat2 = "";
  @Input() image = "";
  @Input() footer = "";
  constructor() {}

  ngOnInit(): void {}
}
