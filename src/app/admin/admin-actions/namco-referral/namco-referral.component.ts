import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-namco-referral',
  templateUrl: './namco-referral.component.html',
  styleUrls: ['./namco-referral.component.scss']
})
export class NamcoReferralComponent implements OnInit {
  namcoReferralFeature: any = {};

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getNamcoReferralSection();
  }

  /**
  * Get the Namco Referral Section feature config.
  * @return {void}
  */
  getNamcoReferralSection(): void {
    this.configService.getFeatureByKey('namco_referral_section').subscribe((res: any) => {
      this.namcoReferralFeature = res.feature;
    });
  }

  /**
  * Update the Namco Referral Section enabled status.
  * @return {void}
  */
  updateNamcoReferralStatus(status: boolean): void {
    this.configService.updateFeatureEnabledStatus(this.namcoReferralFeature.id, status).subscribe(() => {
      this.toastr.success("Namco Referral has been successfully updated", "Update successful!");
      this.getNamcoReferralSection();
    }, () => {
      this.getNamcoReferralSection();
    });
  }

  /**
  * Publish Namco Referral changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(() => {
      this.toastr.success("Namco Referral changes published successfully!", "Changes published!");
    });
  }
}
