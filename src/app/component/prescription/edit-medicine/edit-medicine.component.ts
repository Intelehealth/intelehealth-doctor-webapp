import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-medicine',
  templateUrl: './edit-medicine.component.html',
  styleUrls: ['./edit-medicine.component.css']
})
export class EditMedicineComponent implements OnInit {
  medicines= [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
  ) { }

  ngOnInit(): void {
    for (let index = 0; index < this.data.length; index++) {
      const element = this.data[index];
      let obj = {
        name:element.split(':')[0],
        checked: true
      }
      this.medicines.push(obj);
    }
    
  }
  
  updateMedicine() {
    this.medicines.filter((a)=> a.checked);
  }
}
