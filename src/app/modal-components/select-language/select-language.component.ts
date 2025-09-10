import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from 'src/app/services/app-config.service';
import { setCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-select-language',
  templateUrl: './select-language.component.html',
})
export class SelectLanguageComponent {

  languageForm: FormGroup;
 languages: any[] = [];
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<SelectLanguageComponent>, private translate: TranslateService,private appConfigService: AppConfigService) {
    this.languageForm = new FormGroup({
      language: new FormControl(this.translate.currentLang, Validators.required)
    });
  }
ngOnInit(): void {
    this.languageForm =  new FormGroup({
    language: new FormControl(null, Validators.required)
    });

    this.fetchLanguages();
  }
   fetchLanguages() {
    this.appConfigService.fetchAllLanguage().subscribe(res => {
      this.languages = res.languages || [];
      console.log("Available languages:", this.languages);
      const cachedLang = localStorage.getItem(languages.SELECTED_LANGUAGE);
      console.log("Cached language:", cachedLang);
      if (cachedLang) {
        this.languageForm.patchValue({ language: cachedLang });
      }
    });
  }
  /**
  * Select language
  * @return {void}
  */
  select() {
    this.translate.use(this.languageForm.value.language);
    this.translate.setDefaultLang(this.languageForm.value.language);
    setCacheData(languages.SELECTED_LANGUAGE, this.languageForm.value.language);
    this.dialogRef.close(this.languageForm.value);
    window.location.reload();
  }

  /**
  * Close modal
  * @param {string|boolean} val - Dialog result
  * @return {void}
  */
  close(val: string|boolean) {
    this.dialogRef.close(val);
  }

}
