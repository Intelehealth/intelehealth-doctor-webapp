import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-menu',
  templateUrl: './help-menu.component.html',
  styleUrls: ['./help-menu.component.scss']
})
export class HelpMenuComponent implements OnInit {

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
