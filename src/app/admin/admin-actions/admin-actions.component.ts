import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxRolesService } from 'ngx-permissions';
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
      title: "Insights",
      desc: "AI usage & engagement insights",
      icon: "assets/svgs/ayu-new.svg",
      path: "admin/actions/insights",
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
      title: "Doctor Specialities",
      desc: "Manage Doctor Specialties",
      icon: "assets/svgs/doctor-speciality.svg",
      path: "admin/actions/doctor-specialties",
      isLocalPath: true
    },
    {
      title: "Supported Languages",
      desc: "Manage Mobile/Web App Languages",
      icon: "assets/svgs/mobile-app-lang.svg",
      path: "admin/actions/mobile-app-languages",
      isLocalPath: true
    },
    {
      title: "Patient Vitals",
      desc: "Manage fields to be shown under patient vitals",
      icon: "assets/svgs/patient-vitals.svg",
      path: "admin/actions/patient-vitals",
      isLocalPath: true
    },
    {
      title: "Patient Diagnostics",
      desc: "Manage fields to be shown under patient diagnostics",
      icon: "assets/svgs/patient-diagnosis.svg",
      path: "admin/actions/patient-diagnostics",
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
      title: "Patient Details",
      desc: "Manage features/fields to be shown during patient details",
      icon: "assets/svgs/patient-reg.svg",
      path: "admin/actions/patient-details",
      isLocalPath: true
    },
    {
      title: "Partner White Labelling",
      desc: "Upload partner logo and manage color theme",
      icon: "assets/svgs/partner-label.svg",
      path: "admin/actions/partner-label",
      isLocalPath: true
    },
    {
      title: "User Creation",
      desc: "Create New User",
      icon: "assets/svgs/user-creation.svg",
      path: "admin/actions/user-creation",
      isLocalPath: true
    },
    {
      title: "Patient Visit Summary",
      desc: "Manage data capturing fields on visit summary",
      icon: "assets/svgs/patient-visit-summary.svg",
      path: "admin/actions/patient-visit-summary",
      isLocalPath: true
    },
    {
      title: "WebRTC",
      desc: "Manage WebRTC functionality",
      icon: "assets/svgs/webrtc.svg",
      path: "admin/actions/webrtc",
      isLocalPath: true
    },
    {
      title: "ABHA ID",
      desc: "Manage Abha ID functionality",
      icon: "assets/svgs/abha.svg",
      path: "admin/actions/abha",
      isLocalPath: true
    },
    {
      title: "Sidebar Menu Configuration",
      desc: "Manage Sidebar Menu",
      icon: "assets/svgs/sidebar-circle.png",
      path: "admin/actions/menu-config",
      isLocalPath: true
    },
    {
      title: "Patient Visit Section Configuration",
      desc: "Patient Visit Section Configuration",
      icon: "assets/svgs/patient-visit-summary.svg",
      path: "admin/actions/patient-visit-section",
      isLocalPath: true
    },
    {
      title:"Patient Visit Dropdown",
      desc: "Patient visit dropdown",
      icon: "assets/svgs/patient_visit_dropdown.svg",
      path: "admin/actions/patient-visit-dropdown",
      isLocalPath: true
    },
    {
      title:"Home Screen",
      desc: "Home screen section",
      icon: "assets/svgs/patient_visit_dropdown.svg",
      path: "admin/actions/home-screen",
      isLocalPath: true
    },
    {
      title: "AI LLM",
      desc: "Manage AI LLM functionality",
      icon: "assets/svgs/webrtc.svg",
      path: "admin/actions/ai-llm",
      isLocalPath: true
    },
    {
      title: "Prescription Notes",
      desc: "Manage specialty-wise notes printed on prescriptions",
      icon: "assets/svgs/advice.svg",
      path: "admin/actions/prescription-notes",
      isLocalPath: true
    },
    {
      title: "Namco Referral",
      desc: "Manage Namco Referral functionality",
      icon: "assets/svgs/referral.svg",
      path: "admin/actions/namco-referral",
      isLocalPath: true
    },
    {
      title: "AI Issue Reports",
      desc: "Review AI-generated suggestions flagged by doctors",
      icon: "assets/svgs/alert-triangle.svg",
      path: "admin/actions/ai-issue-reports",
      isLocalPath: true
    },
  ];
  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private router: Router,
    private rolesService: NgxRolesService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    if (!(environment as any).insightsEnabled) {
      this.itemList = this.itemList.filter((i) => i.path !== 'admin/actions/insights');
    }
    if (!this.rolesService.getRole('ORGANIZATIONAL:SYSTEM ADMINISTRATOR')) {
      this.itemList = this.itemList.filter((i) => i.path !== 'admin/actions/ai-issue-reports');
    }
  }

  onModifyClick(item: { isLocalPath: any; path: string | URL; }){
    if(item.isLocalPath)
      this.router.navigate([item.path]);
    else
      window.open(item.path,'_blank');
  }
}
