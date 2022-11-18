import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-professional-details',
  templateUrl: './professional-details.component.html',
  styleUrls: ['./professional-details.component.scss']
})
export class ProfessionalDetailsComponent implements OnInit {
  @Output() onToggleBack: EventEmitter<boolean> = new EventEmitter();
  
  disableSelect = new FormControl(false);
  toppings = new FormControl('');
  toppingList: string[] = ['Hindi', 'English', 'Gujrati', 'Tamil', 'Bangla'];
  moveTo: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  toggleBack(){
    this.onToggleBack.emit(false);
  }
}
