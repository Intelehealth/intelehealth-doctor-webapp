import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-view-plan',
  templateUrl: './view-plan.component.html',
  styleUrls: ['./view-plan.component.scss']
})
export class ViewPlanComponent implements OnInit {

  prescribedPlan = [];
  prescribedMedication = [];
  prescribedOxytocin = [];
  prescribedIV = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<ViewPlanComponent>) { }

  ngOnInit(): void {
    if (this.data) {
      for (const element of this.data.planData) {
        this.prescribedPlan.push({
          id: element.uuid,
          planValue: element.value,
          isDeleted: false,
          index: -1,
          canEdit: element.canEdit,
          obsDatetime: element.obsDatetime,
          creator: element.creator,
          initial: element.initial
        })
      }

      for (const element of this.data.medicationData) {
        let medicine = element.value.split('|').map((o: string) => o.trim());
        this.prescribedMedication.push({
          id: element.uuid,
          typeOfMedicine: medicine[0],
          medicineName: medicine[1],
          strength: medicine[2],
          dosage: medicine[3].includes('::') ? medicine[3].split('::')[0] : null,
          dosageUnit: medicine[3].includes('::') ? medicine[3].split('::')[1] : null,
          frequency: medicine[4],
          routeOfMedicine: medicine[5],
          duration: medicine[6].includes('::') ? medicine[6].split('::')[0] : null,
          durationUnit: medicine[6].includes('::') ? medicine[6].split('::')[1] : null,
          remark: (medicine.length === 8)? medicine[7] : null,
          obsDatetime: element.obsDatetime,
          creator: element.creator,
          initial: element.initial
        });
      }

      for (const element of this.data.oxytocinData) {
        this.prescribedOxytocin.push({
          id: element.uuid,
          strength: element.value.strength,
          infusionRate: element.value.infusionRate,
          infusionStatus: element.value.infusionStatus,
          obsDatetime: element.obsDatetime,
          creator: element.creator,
          initial: element.initial
        });
      }

      for (const element of this.data.ivData) {
        this.prescribedIV.push({
          id: element.uuid,
          type: element.value.type,
          otherType: element.value.otherType,
          infusionRate: element.value.infusionRate,
          infusionStatus: element.value.infusionStatus,
          obsDatetime: element.obsDatetime,
          creator: element.creator,
          initial: element.initial
        });
      }
    }
  }

  close(val: any) {
    this.dialogRef.close(val);
  }

}
