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
      this.messages.splice(0, 0, this.message);
      this.message = "";
    }
  }

}
