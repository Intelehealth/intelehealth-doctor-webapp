import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  showSplash = true;

  constructor() { }

  ngOnInit() {
    document.body.classList.add(`client-${environment.client}`);
    setTimeout(() => {
      this.showSplash = false;
    }, 1000);
  }

}
