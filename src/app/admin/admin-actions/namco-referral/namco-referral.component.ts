import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { FeatureModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-namco-referral',
  templateUrl: './namco-referral.component.html',
  styleUrls: ['./namco-referral.component.scss']
})
export class NamcoReferralComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'platform', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  namcoReferralData: FeatureModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getNamcoReferral();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Get the Namco Referral feature config.
  * @return {void}
  */
  getNamcoReferral(): void {
    this.configService.getFeatures().subscribe(res => {
      this.namcoReferralData = res.feature?.filter((v: FeatureModel) => v.key === 'namco_referral_section');
      this.dataSource = new MatTableDataSource(this.namcoReferralData);
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
  * Update Namco Referral status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(() => {
      const name = this.namcoReferralData?.find((v: FeatureModel) => v.id === id)?.name;
      this.toastr.success(`${name} has been successfully updated`, "Update successful!");
      this.getNamcoReferral();
    }, () => {
      this.getNamcoReferral();
    });
  }

  /**
  * Publish Namco Referral changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(() => {
      const name = this.namcoReferralData?.find((v: FeatureModel) => v.key === 'namco_referral_section')?.name;
      this.toastr.success(`${name} changes published successfully!`, "Changes published!");
    });
  }
}
