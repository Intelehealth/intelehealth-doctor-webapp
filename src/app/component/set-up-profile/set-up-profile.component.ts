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

  constructor(
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    const doctorName = getFromStorage("doctorName");
    this.doctorName = doctorName;
    this.selectLanguage()
  }

  selectLanguage(): void {
    const dialogRef = this.matDialog.open(SelectLanguageComponent,{
      data: {},
    });
  }
}


