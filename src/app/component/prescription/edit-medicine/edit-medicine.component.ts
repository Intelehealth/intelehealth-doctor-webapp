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
  medicineUpdated = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<EditMedicineComponent>,
    private visitService: VisitService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.visitIdd = this.data.visitId;
    const { medications = [], medicineData = [] } = this.data;
    medications.forEach((medication) => {
      const [med] = medication.split(":");
      const attr = medicineData.find((m) => m.value.includes(med));
      let medicine: any = {
        name: med,
        checked: true,
      };
      if (attr) {
        medicine.value = attr.value;
        medicine.uuid = attr.uuid;
        const [_, checked] = attr.value.split("||");
        medicine.checked = JSON.parse(checked);
      }
      this.medicines.push(medicine);
    });
  }

  updateMedicine() {
    saveToStorage("session", environment.tempToken);
    this.medicines.forEach((med) => {
      const payload = {
        attributeType: "bf6483f5-a73a-454a-b459-2d2cf3338330",
        value: `${med.name}||${med.checked}`,
      };
      if (med.uuid) {
        this.visitService
          .setVisitAttribute(this.visitIdd, payload, med)
          .subscribe((response) => {
            this.medicineUpdated.push(true);
            this.checkAndClosePopup();
          });
      } else {
        this.visitService
          .setVisitAttribute(this.visitIdd, payload)
          .subscribe((response) => {
            this.medicineUpdated.push(true);
            this.checkAndClosePopup();
          });
      }
    });
  }

  checkAndClosePopup() {
    if (this.medicineUpdated?.length >= this.data?.medications?.length) {
      this.snackbar.open("Medicine Updated Successfully", null, {
        duration: 4000,
      });
      this.dialogRef.close();
      deleteFromStorage("session");
      location.reload();
    }
  }
}
