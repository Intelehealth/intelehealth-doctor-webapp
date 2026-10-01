import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-qms',
  templateUrl: './qms.component.html',
  styleUrls: ['./qms.component.scss']
})
export class QmsComponent implements OnInit {

  qmsFeature: any = {};

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getQmsFeature();
  }

  /**
  * Get QMS feature config.
  * @return {void}
  */
  getQmsFeature(): void {
    this.configService.getFeatureByKey('qms_section').subscribe((res: any) => {
      this.qmsFeature = res.feature ?? {};
    });
  }

  /**
  * Update QMS enabled status.
  * @param {Event} event - checkbox change event
  * @return {void}
  */
  updateQmsStatus(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.configService.updateFeatureEnabledStatus(this.qmsFeature.id, checked).subscribe(res => {
      this.toastr.success("QMS has been successfully updated", "Update successful!");
      this.getQmsFeature();
    }, err => {
      this.getQmsFeature();
    });
  }

  /**
  * Publish QMS changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("QMS changes published successfully!", "Changes published!");
    });
  }
}
