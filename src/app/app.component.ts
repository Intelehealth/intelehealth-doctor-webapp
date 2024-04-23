import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/services/app-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  cssConv: string;

  constructor(
    public translate: TranslateService,
    public appConfigService : AppConfigService
  ) {
    translate.addLangs(['en', 'ru']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    translate.use(browserLang.match(/en|fr/) ? browserLang : 'en');
  }

  ngOnInit() {
    this.appConfigService.getPrimaryColor().then((colors) => {      
      document.documentElement.style.setProperty('--color-darkBlue', colors['primaryColor']); // Primary Color
      document.documentElement.style.setProperty('--color-lightViolet', colors['secondaryColor']); // Secondary Color
      document.documentElement.style.setProperty('--color-lightBlue', colors['primaryColor']); // Primary Color
    });
  }

}
