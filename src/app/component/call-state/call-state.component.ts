import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-call-state',
  templateUrl: './call-state.component.html',
  styleUrls: ['./call-state.component.scss'],
})
export class CallStateComponent implements OnInit {
  @Input() conversation;
  message = '';
  collapsed_message = true;
      
  conversations = [
    { id: 1, body: 'Hi! How is patient feeling now?', me: true },
    { id: 2, body: 'The patient was not feeling good for 2-3 days but lately the patient is doing well. ', me: false },
    { id: 3, body: 'Great to hear. Keep me posted on the patient.', me: false },
    { id: 4, body: 'Hi! How is patient feeling now?', me: true },
]

  constructor() { }

  ngOnInit(): void {
  }

  toggleCollapseMessage(): void {
    this.collapsed_message = !this.collapsed_message;
  }

  submitMessage(event) {
    let value = event.target.value.trim();    
    this.message = '';
    if (value.length < 1) return false;
    this.conversations.unshift({
      id: 1,
      body: value,
      me: true,
    });
  }
}
