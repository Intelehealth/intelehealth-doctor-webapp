import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "src/environments/environment";
declare var saveToStorage, deleteFromStorage;
@Component({
  selector: "app-edit-medicine",
  templateUrl: "./edit-medicine.component.html",
  styleUrls: ["./edit-medicine.component.css"],
})
export class EditMedicineComponent implements OnInit {
  medicines = [];
  visitIdd;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<EditMedicineComponent>,
    private visitService: VisitService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.visitIdd = this.data.visitId;
    const { medications = [], medicineData } = this.data;
    const medValue = medicineData?.value || "";
    const medData = medValue.split(",");
    medications.forEach((medication) => {
      let [med] = medication.split(":");
      if (med.charAt(0) == " ") med = med.replace(" ", "");
      const checked = medData.includes(med) ? true : false;
      let medicine: any = {
        name: med,
        checked,
      };
      this.medicines.push(medicine);
    });
  }

  updateMedicine() {
    saveToStorage("session", environment.tempToken);
    const uuid = this.data?.medicineData?.uuid;
    const value = this.medicines
      .filter((m) => m?.checked)
      .map((m) => m?.name)
      .join();
    const payload = {
      attributeType: "ba1e259f-8911-439d-abde-fb6c24c1e3c2",
      value,
    };
    if (uuid) {
      this.visitService
        .setVisitAttribute(this.visitIdd, payload, { uuid })
        .subscribe((response) => {
          this.close();
        });
    } else {
      this.visitService
        .setVisitAttribute(this.visitIdd, payload)
        .subscribe((response) => {
          this.close();
        });
    }
  }

  close() {
    this.snackbar.open("Medicine Updated Successfully", null, {
      duration: 4000,
    });
    this.dialogRef.close();
    deleteFromStorage("session");
    location.reload();
  }
}
