import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SelectLanguageComponent } from './select-language/select-language.component';
declare const getFromStorage: Function;

@Component({
  selector: 'app-set-up-profile',
  templateUrl: './set-up-profile.component.html',
  styleUrls: ['./set-up-profile.component.scss']
})
export class SetUpProfileComponent implements OnInit {
  doctorName = "";
  greeting = "";
  constructor(
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName;
    this.selectLanguage()
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

  selectLanguage(): void {
    const dialogRef = this.matDialog.open(SelectLanguageComponent,{
      data: {},
    });
  }
}


