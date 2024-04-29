import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-actions',
  templateUrl: './admin-actions.component.html',
  styleUrls: ['./admin-actions.component.scss']
})
export class AdminActionsComponent implements OnInit {
  baseURLLegacy: string = environment.baseURLLegacy;
  itemList = [
    {
      title: "Ayu",
      desc: "Ayu",
      icon: "assets/svgs/ayu-new.svg",
      path: "admin/actions/ayu",
      isLocalPath: true
    },
    {
      title: "System Admin",
      desc: "Redirect to System Admin portal",
      icon: "assets/svgs/system-admin.svg",
      path: this.baseURLLegacy + "/admin/index.htm",
      isLocalPath: false
    },
    {
      title: "Doctor Speciality",
      desc: "Manage Doctor Specialties",
      icon: "assets/svgs/doctor-speciality.svg",
      path: "admin/actions/doctor-specialties",
      isLocalPath: true
    },
    {
      title: "Mobile App Language",
      desc: "Manage Mobile App Languages",
      icon: "assets/svgs/mobile-app-lang.svg",
      path: "admin/actions/mobile-app-languages",
      isLocalPath: true
    },
    {
      title: "Patient Vitals",
      desc: "Manage fields to be shown under patient vitals",
      icon: "assets/svgs/patient-vitals.svg",
      path: "admin/config/patien-vitals",
      isLocalPath: true
    },
    {
      title: "Patient Registration",
      desc: "Manage fields to be shown during patient registration",
      icon: "assets/svgs/patient-reg.svg",
      path: "admin/actions/patient-registration",
      isLocalPath: true
    },
    {
      title: "Partner White Labelling",
      desc: "Upload partner logo and manage color theme",
      icon: "assets/svgs/partner-label.svg",
      path: "admin/config/patien-vitals",
      isLocalPath: true
    },
    {
      title: "User Creation",
      desc: "Create New User",
      icon: "assets/svgs/user-creation.svg",
      path: this.baseURLLegacy + "/admin/users/users.list",
      isLocalPath: false
    },
  ];
  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
  }

  onModifyClick(item){
    if(item.isLocalPath)
      this.router.navigate([item.path]);
    else
      window.open(item.path,'_blank');
  }
}
