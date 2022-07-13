import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-weight-history',
  templateUrl: './weight-history.component.html',
  styleUrls: ['./weight-history.component.css']
})
export class WeightHistoryComponent implements OnInit {
  public selectedHistory: any;
  historyTypes = ['Weight Gain', 'Weight Loss']

  constructor() { }

  ngOnInit(): void {
  }

  get isInvalid() {
    return !this.selectedHistory;
  }

  submit() {
    console.log(this.selectedHistory);
  }
}
