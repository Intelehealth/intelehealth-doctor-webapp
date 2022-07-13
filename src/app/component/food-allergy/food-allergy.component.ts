import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-food-allergy',
  templateUrl: './food-allergy.component.html',
  styleUrls: ['./food-allergy.component.css']
})
export class FoodAllergyComponent implements OnInit {
  public allergy: any

  constructor() { }

  ngOnInit(): void {
  }

  get isInvalid() {
    return !this.allergy;
  }

  submit() {

  }

}
