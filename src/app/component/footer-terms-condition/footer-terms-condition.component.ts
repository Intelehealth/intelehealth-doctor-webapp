import { Component, Input, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { VisitService } from "src/app/services/visit.service";
import { HelpmenuComponent } from "../helpmenu/helpmenu.component";

@Component({
  selector: "app-footer-terms-condition",
  templateUrl: "./footer-terms-condition.component.html",
  styleUrls: ["./footer-terms-condition.component.scss"],
})
export class FooterTermsConditionComponent implements OnInit {
  @Input() showTermsAndCondition: boolean = false;
  dialogRef: any;

  constructor(public dialog: MatDialog, private visitSvc: VisitService) {}

  ngOnInit(): void {}

  openDialog() {
    if (this.dialogRef) {
      this.dialog.closeAll();
      return;
    }
    this.dialogRef = this.dialog.open(HelpmenuComponent, {
      panelClass: "chatbot-container",
      backdropClass: "chatbot-backdrop",
      width: "100%",
      maxHeight: "500px",
      maxWidth: "300px",
      position: { bottom: "80px", right: "60px" },
      hasBackdrop: false,
    });

    this.dialogRef.afterClosed().subscribe((result) => {
      // console.log(`Dialog result: ${result}`);
      this.dialogRef = undefined;
    });
  }

  get isHelpButtonShow() {
    return this.visitSvc.isHelpButtonShow;
  }
}
