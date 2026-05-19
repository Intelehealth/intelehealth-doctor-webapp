import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss']
})
export class SplashComponent implements OnInit {

  isNepalClient: boolean = environment.client === 'nepal' && !environment.forceEzaziBranding;

  constructor() { }

  ngOnInit(): void {
  }

}
