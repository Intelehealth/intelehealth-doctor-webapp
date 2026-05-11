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
    if (environment.client === 'nepal') {
      document.title = 'NEzazi';
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
      if (favicon) {
        favicon.type = 'image/png';
        favicon.href = '/assets/nepal/jhpiego-removebg-preview.png';
      }
      const apple = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement | null;
      if (apple) apple.href = '/assets/icons/nepal/icon-192x192-20260507.png';
      const manifest = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (manifest) manifest.href = 'manifest.nepal.webmanifest?v=20260507';
    }
    setTimeout(() => {
      this.showSplash = false;
    }, 1000);
  }

}
