import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class TranslationService {

  constructor( private translateService: TranslateService,
    private snackbar: MatSnackBar,   @Inject(DOCUMENT) private document: Document) { }

  getTranslation(msg:string) {
    this.translateService.get(`messages.${msg}`).subscribe((res: string) => {
      this.snackbar.open(res, null, {duration: 4000});
    });
  }

  getSelectedLanguage() {
    this.translateService.setDefaultLang(localStorage.getItem('selectedLanguage'));
  }

  getDropdownTranslation(element:string, elementName:string) {
    return this.translateService.instant(`${element}.${elementName}`);
  }

  changeCssFile(lang: string) {
    let htmlTag = this.document.getElementsByTagName(
      "html"
    )[0] as HTMLHtmlElement;
    htmlTag.dir = lang === "ar" ? "rtl" : "ltr";
    this.translateService.setDefaultLang(lang);
    this.translateService.use(lang);
    
    let headTag = this.document.getElementsByTagName(
      "head"
    )[0] as HTMLHeadElement;
    let existingLink = this.document.getElementById(
      "langCss"
    ) as HTMLLinkElement;

    let bundleName = lang === "ar" ? "arabicStyle.css" : "englishStyle.css";

    if (existingLink) {
      existingLink.href = bundleName;
    } else {
      let newLink = this.document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.type = "text/css";
      newLink.id = "langCss";
      newLink.href = bundleName;
      headTag.appendChild(newLink);
    }
  }
}