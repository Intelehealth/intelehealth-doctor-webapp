import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit(): void {
    this.selectedLicense = this.LicenseList[0];
  }

}
