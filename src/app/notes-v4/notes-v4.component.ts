import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-notes-v4",
  templateUrl: "./notes-v4.component.html",
  styleUrls: ["./notes-v4.component.scss"],
})
export class NotesV4Component implements OnInit {
  isCollapsed = false;
  noteData = [
    {
      label: "Please make sure the patient takes all the medicines",
    },
    {
      label:
        "Please let the patient know that taking proper rest is very important for atleast 1 week",
    },
  ];

  constructor() {}

  ngOnInit(): void {}
}
