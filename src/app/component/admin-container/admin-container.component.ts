import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LicenseKeyFormComponent } from './../license-key-form/license-key-form.component'

@Component({
  selector: 'app-admin-container',
  templateUrl: './admin-container.component.html',
  styleUrls: ['./admin-container.component.scss']
})
export class AdminContainerComponent implements OnInit {
  selectedLicense: any;
  LicenseList = [
    { name: "Intehelathtest2022" }, 
    { name: "Intehelathtest2021" },
    { name: "Intehelathtest2020" }
  ];
  constructor(private matDialog: MatDialog) { }

  ngOnInit(): void {
    this.selectedLicense = this.LicenseList[0];
  }

  onOpenDialogClick(){
    this.matDialog.open(LicenseKeyFormComponent);
  }
}
