import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-license-key-form',
  templateUrl: './license-key-form.component.html',
  styleUrls: ['./license-key-form.component.scss']
})
export class LicenseKeyFormComponent implements OnInit {
  onShowHideLicense: boolean = true;
  onShowHideFile: boolean = false;
  onShowHideUpload: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  onToggle(){
    this.onShowHideFile = true
    this.onShowHideLicense = false;
  }
  
  onToggleNext(){
    this.onShowHideFile = false;
    this.onShowHideUpload = true;
  }
}