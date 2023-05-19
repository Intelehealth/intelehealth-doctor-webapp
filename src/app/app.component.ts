import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  languages = ["en", "ru"];
  selectedLanguage: string = "ru";
  constructor(public translate: TranslateService) {}

  ngOnInit() {
    if (localStorage.getItem("selectedLanguage")) {
      this.translate.setDefaultLang(localStorage.getItem("selectedLanguage"));
      this.selectedLanguage = localStorage.getItem("selectedLanguage");
      const browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang.match(/en|fr/) ? browserLang : localStorage.getItem("selectedLanguage"));  
    } else {
      this.translate.setDefaultLang(this.selectedLanguage);
      const browserLang = this.translate.getBrowserLang();
      this.translate.use(browserLang.match(/ru|fr/) ? browserLang : 'ru');
      localStorage.setItem("selectedLanguage", this.selectedLanguage);
    }
  }
}
