import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class TranslationService {

  constructor( private translateService: TranslateService,
    private snackbar: MatSnackBar) { }

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

}
