import { Component, OnInit } from '@angular/core';
declare const getFromStorage: Function;

@Component({
  selector: 'app-set-up-profile',
  templateUrl: './set-up-profile.component.html',
  styleUrls: ['./set-up-profile.component.scss']
})
export class SetUpProfileComponent implements OnInit {
  doctorName = "";

  constructor() { }

  ngOnInit(): void {
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName;
  }

}


