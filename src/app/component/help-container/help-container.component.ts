import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help-container',
  templateUrl: './help-container.component.html',
  styleUrls: ['./help-container.component.scss']
})
export class HelpContainerComponent implements OnInit {
  panelOpenState = false;
  constructor() { }

  ngOnInit(): void {
  }

}
