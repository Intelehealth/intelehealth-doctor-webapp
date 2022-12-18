import { Component, OnInit } from '@angular/core';
declare const getFromStorage: Function;

@Component({
  selector: 'app-set-up-profile',
  templateUrl: './set-up-profile.component.html',
  styleUrls: ['./set-up-profile.component.scss']
})
export class SetUpProfileComponent implements OnInit {
  doctorName = "";
  greeting = "";
  constructor() { }

  ngOnInit(): void {
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName;
    var today = new Date()
    var curHr = today.getHours()

    if (curHr < 12) {
     this.greeting = "Good Morning";
    } else if (curHr < 18) {
      this.greeting = 'Good Afternoon';
    } else {
      this.greeting = 'Good Evening';
    }
  }

}


