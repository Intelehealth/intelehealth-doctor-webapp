import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { getCacheData } from '../utils/utility-functions';
import { languages } from 'src/config/constant';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {

  constructor(private translateService: TranslateService,
    private toastr: ToastrService,) { }

  getTranslation(msg1:string, msg2:string, flag:boolean) {
    if(flag) {
      this.toastr.success(this.translateService.instant(msg1), this.translateService.instant(msg2));
    } else{
      this.toastr.error(this.translateService.instant(msg1), this.translateService.instant(msg2));
    }
  }

  getSelectedLanguage() {
    return this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
  }

  getDropdownTranslation(element:string, elementName:string) {
    return this.translateService.instant(`${element}.${elementName}`);
  }
}
