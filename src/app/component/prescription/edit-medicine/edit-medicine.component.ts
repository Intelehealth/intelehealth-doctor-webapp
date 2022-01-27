import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { VisitService } from 'src/app/services/visit.service';

@Component({
  selector: 'app-edit-medicine',
  templateUrl: './edit-medicine.component.html',
  styleUrls: ['./edit-medicine.component.css']
})
export class EditMedicineComponent implements OnInit {
  medicines= [];
  visitIdd;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private visitService: VisitService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.visitIdd =this.data.visitId;
    for (let index = 0; index < this.data.medications.length; index++) {
      const element = this.data.medications[index];
      let obj = {
        name:element.split(':')[0],
        checked: true
      }
      this.medicines.push(obj);
    }
    
  }
  
  updateMedicine() {
    this.medicines.filter((a)=> a.checked);
    const updatedMedicationName = this.medicines.map(a=>{
      return a.name + '||' + a.checked 
    })
    updatedMedicationName.forEach(value=>{
      const payload = {
        "attributeType": "bf6483f5-a73a-454a-b459-2d2cf3338330",
        "value": value
      }
      this.visitService
      .setVisitAttribute(this.visitIdd,payload)
      .subscribe((response) => {
        console.log('response: ', response);
        })
      })

  }

}
