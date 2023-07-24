import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
declare var getFromStorage: any;

@Injectable({
  providedIn: 'root'
})

export class TranslationService {
  public isManagerRole = false;

  constructor(private translateService: TranslateService,
    private snackbar: MatSnackBar, @Inject(DOCUMENT) private document: Document) {
    const userDetails = getFromStorage('user');
    if (userDetails) {
      const roles = userDetails['roles'];
      roles.forEach(role => {
        if (role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a") {
          this.isManagerRole = true;
        }
      });
    }
  }

  getTranslation(msg: string, duration = 4000) {
    this.translateService.get(`messages.${msg}`).subscribe((res: string) => {
      this.snackbar.open(res, null, { duration, direction: this.txtDirection });
    });
  }

  get txtDirection(): MatSnackBarConfig['direction'] {
    return this.selectedLang === 'ar' ? "rtl" : "ltr";
  }

  get selectedLang() {
    return localStorage.getItem("selectedLanguage")
  }

  getSelectedLanguage() {
    this.translateService.setDefaultLang(localStorage.getItem('selectedLanguage'));
  }

  getDropdownTranslation(element: string, elementName: string) {
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
