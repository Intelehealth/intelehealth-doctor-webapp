import { Component, OnInit, ViewEncapsulation } from "@angular/core";

@Component({
  selector: "app-tabs-v4",
  templateUrl: "./tabs-v4.component.html",
  styleUrls: ["./tabs-v4.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TabsV4Component implements OnInit {
  constructor() {}
  selectedIndex = 0;

  ngOnInit(): void {}
}
