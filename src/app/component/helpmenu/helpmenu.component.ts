import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-helpmenu',
  templateUrl: './helpmenu.component.html',
  styleUrls: ['./helpmenu.component.scss']
})
export class HelpmenuComponent implements OnInit {

  messages: any = [];
  message: string = "";

  constructor() { }

  ngOnInit(): void {
  }

  addMessage() {
    if (this.message) {
      this.messages.push(this.message);
      this.message = "";
    }
  }

}
