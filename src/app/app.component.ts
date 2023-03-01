import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HelpMenuComponent } from './modal-components/help-menu/help-menu.component';
import { CoreService } from './services/core/core.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  dialogRef: MatDialogRef<HelpMenuComponent>;

  constructor(private cs: CoreService) { }

  ngOnInit() { }

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
