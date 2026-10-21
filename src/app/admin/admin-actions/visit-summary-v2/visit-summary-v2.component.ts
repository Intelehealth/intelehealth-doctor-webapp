import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-visit-summary-v2-config',
  templateUrl: './visit-summary-v2.component.html',
  styleUrls: ['./visit-summary-v2.component.scss']
})
export class VisitSummaryV2ConfigComponent implements OnInit {
  visitSummaryV2Feature: any = {};

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getVisitSummaryV2Section();
  }

  /**
  * Get the Visit Summary V2 Section feature config.
  * @return {void}
  */
  getVisitSummaryV2Section(): void {
    this.configService.getFeatureByKey('visit_summary_v2_section').subscribe((res: any) => {
      this.visitSummaryV2Feature = res.feature;
    });
  }

  /**
  * Update the Visit Summary V2 Section enabled status.
  * @return {void}
  */
  updateVisitSummaryV2Status(status: boolean): void {
    this.configService.updateFeatureEnabledStatus(this.visitSummaryV2Feature.id, status).subscribe(() => {
      this.toastr.success("Visit Summary V2 has been successfully updated", "Update successful!");
      this.getVisitSummaryV2Section();
    }, () => {
      this.getVisitSummaryV2Section();
    });
  }

  /**
  * Publish Visit Summary V2 changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(() => {
      this.toastr.success("Visit Summary V2 changes published successfully!", "Changes published!");
    });
  }
}
