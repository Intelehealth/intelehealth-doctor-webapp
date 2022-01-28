import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.css"],
})
export class ConfirmDialogComponent implements OnInit {
  type;
  selectedReason = "";
  otherReason = "";
  reasons = ["Doctor Not available", "Patient Not Available", "Other"];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    public dialogRef: MatDialogRef<ConfirmDialogComponent>
  ) {
    this.type = data?.type;
  }

  ngOnInit() {}

  closeDialog() {
    this.dialogRef.close(false);
  }

  get reason() {
    let reason;
    if (this.selectedReason === this.reasons[2]) reason = this.otherReason;
    else reason = this.selectedReason;
    localStorage.reason = reason;
    return reason;
  }

  get disabled() {
    return this.type === "cancelAppointment" ? !this.reason : false;
  }
}
