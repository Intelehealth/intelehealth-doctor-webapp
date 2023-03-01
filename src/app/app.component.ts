import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HelpMenuComponent } from './modal-components/help-menu/help-menu.component';
import { CommonModalComponent } from './modals/common-modal/common-modal.component';
import { AuthService } from './services/auth.service';
import { CoreService } from './services/core/core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  @ViewChild("confirmLogout") confirmLogout: CommonModalComponent;

  dialogRef: MatDialogRef<HelpMenuComponent>;

  confirmLogoutModal: any = {
    mainText: "Logout",
    subText: "Are you sure you want to logout?",
    leftBtnText: "No",
    leftBtnOnClick: () => { },
    rightBtnText: "Yes",
    rightBtnOnClick: () => {
      this.authSvc.confirmLogout();
    },
    windowClass: 'logout-confirm',
    circleIconPath: "assets/svgs/warning-circle.svg",
  };

  constructor(private cs: CoreService, private authSvc: AuthService) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.authSvc.confirmLogoutModal = this.confirmLogout;
  }

  openHelpMenu() {
    if (this.dialogRef) {
      this.dialogRef.close();
      return;
    };
    this.dialogRef = this.cs.openHelpMenuModal();
    this.dialogRef.afterClosed().subscribe(result => {
      this.dialogRef = undefined;
    });
  }

}
