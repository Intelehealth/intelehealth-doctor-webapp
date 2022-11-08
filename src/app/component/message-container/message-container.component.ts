import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-message-container',
  templateUrl: './message-container.component.html',
  styleUrls: ['./message-container.component.scss']
})
export class MessageContainerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }
  conversation;


  onConversationSelected(conversation){
    this.conversation = conversation;
  }
}
