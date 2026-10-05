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
  featureMissing = false;
  isSaving = false;

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
  * Whether the toggle and publish buttons can be used.
  * @return {boolean}
  */
  get canEdit(): boolean {
    return !!this.qmsFeature?.id && !this.isSaving;
  }

  /**
  * Get QMS feature config.
  * @return {void}
  */
  getQmsFeature(): void {
    this.configService.getFeatureByKey('qms_section').subscribe((res: any) => {
      this.qmsFeature = res?.feature ?? {};
      this.featureMissing = !this.qmsFeature?.id;
    }, () => {
      this.qmsFeature = {};
      this.featureMissing = true;
      this.toastr.error("Could not load the QMS setting, please refresh the page.", "Load failed!");
    });
  }

  /**
  * Update QMS enabled status.
  * @param {boolean} checked - new enabled status
  * @return {void}
  */
  updateQmsStatus(checked: boolean): void {
    if (!this.qmsFeature?.id || this.isSaving) { return; }
    this.isSaving = true;
    this.configService.updateFeatureEnabledStatus(this.qmsFeature.id, checked).subscribe(() => {
      this.isSaving = false;
      this.toastr.success("QMS has been successfully updated", "Update successful!");
      this.getQmsFeature();
    }, () => {
      this.isSaving = false;
      this.toastr.error("QMS could not be updated, please try again.", "Update failed!");
      this.getQmsFeature();
    });
  }

  /**
  * Publish all pending configuration changes.
  * @return {void}
  */
  onPublish(): void {
    if (this.isSaving) { return; }
    this.isSaving = true;
    this.configService.publishConfig().subscribe(() => {
      this.isSaving = false;
      this.toastr.success("All pending configuration changes published successfully!", "Changes published!");
    }, () => {
      this.isSaving = false;
      this.toastr.error("Changes could not be published, please try again.", "Publish failed!");
    });
  }
}
