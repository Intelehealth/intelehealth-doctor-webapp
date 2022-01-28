import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';
declare var saveToStorage, deleteFromStorage;
@Component({
  selector: 'app-edit-medicine',
  templateUrl: './edit-medicine.component.html',
  styleUrls: ['./edit-medicine.component.css']
})
export class EditMedicineComponent implements OnInit {
  medicines = [];
  visitIdd;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialogRef: MatDialogRef<EditMedicineComponent>,
    private visitService: VisitService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {

    this.visitIdd = this.data.visitId;
    for (let index = 0; index < this.data.medications.length; index++) {
      const element = this.data.medications[index];

      console.log(this.data.medicineData,"------31");

      if (element.split(':')[0] === this.data.medicineData.value.split('||')[0]) {
        let obj = {
          name: element.split(':')[0],
          checked: JSON.parse(this.data.medicineData.value.split('||')[1])
        }
        this.medicines.push(obj);
      }
    }
  }

  updateMedicine() {
    this.medicines.filter((a) => a.checked);
    // console.log('this.medicines: ', this.medicines);
    const updatedMedicationName = this.medicines.map(a => {
      return a.name + '||' + a.checked
    })
    console.log('updatedMedicationName: ', updatedMedicationName);
    saveToStorage("session", environment.tempToken);

    updatedMedicationName.forEach(value => {
      this.data.medicineData.find(a=>{
        console.log(a,'---54');
        a.this.data.medicineData.value.split('||')[0]
      })
      const payload = {
        "attributeType": "bf6483f5-a73a-454a-b459-2d2cf3338330",
        "value": value
      }
      this.visitService
        .setVisitAttribute(this.visitIdd, payload)
        .subscribe((response) => {
          const splitValue = response['value'].split('||')[1];
          // if(splitValue){

          // }
          this.snackbar.open("Medicine Updated Successfully", null, {
            duration: 4000,
          });
        })
      this.dialogRef.close();

    })
    deleteFromStorage("session");

  }

}
