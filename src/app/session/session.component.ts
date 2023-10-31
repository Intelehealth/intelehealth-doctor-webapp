import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { getCacheData, setCacheData } from '../utils/utility-functions';
import { languages } from 'src/config/constant';
import { DataItemModel, SlideModel } from '../model/model';

@Component({
  selector: 'app-session',
  templateUrl: './session.component.html',
  styleUrls: ['./session.component.scss']
})
export class SessionComponent implements OnInit {

  slides: SlideModel[] = [
    {
      img_url: "assets/svgs/slide-1.svg",
      title: "Deliver quality health care where there is no doctor",
      description: "",
      heartbeat1: "assets/images/login/right_red_heartbeat.png",
      heartbeat2: "assets/images/login/right_green_heartbeat.png"
    },
    {
      img_url: "assets/svgs/slide-2.svg",
      title: "2,75,000 population covered from 215 villages in 2 countries",
      description: "",
      heartbeat1: "assets/images/login/right_green_heartbeat.png",
      heartbeat2: "assets/images/login/right_red_heartbeat.png"
    },
    {
      img_url: "assets/svgs/slide-3.svg",
      title: "Take online consultations and send prescriptions to the patients virtually",
      description: "",
      heartbeat1: "assets/images/login/right_red_heartbeat.png",
      heartbeat2: "assets/images/login/right_green_heartbeat.png"
    }
  ];

  selectedLanguage: string = 'en';
  languages: DataItemModel[] = [
    {
      id: 1,
      name: 'English',
      code: 'en'
    },
    {
      id: 2,
      name: 'Russian',
      code: 'ru'
    }
  ];

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
    if(getCacheData(false, languages.SELECTED_LANGUAGE)) {
      this.selectedLanguage = getCacheData(false, languages.SELECTED_LANGUAGE);
    }
  }

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    setCacheData( languages.SELECTED_LANGUAGE, this.selectedLanguage);
    window.location.reload();
  }

}
