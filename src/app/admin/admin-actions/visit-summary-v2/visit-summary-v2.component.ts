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
  selector: 'app-visit-summary-v2-config',
  templateUrl: './visit-summary-v2.component.html',
  styleUrls: ['./visit-summary-v2.component.scss']
})
export class VisitSummaryV2ConfigComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'platform', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  visitSummaryV2Data: FeatureModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getVisitSummaryV2();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Get the Visit Summary V2 feature config.
  * @return {void}
  */
  getVisitSummaryV2(): void {
    this.configService.getFeatures().subscribe(res => {
      this.visitSummaryV2Data = res.feature?.filter((v: FeatureModel) => v.key === 'visit_summary_v2_section');
      this.dataSource = new MatTableDataSource(this.visitSummaryV2Data);
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
  * Update Visit Summary V2 status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(() => {
      const name = this.visitSummaryV2Data?.find((v: FeatureModel) => v.id === id)?.name;
      this.toastr.success(`${name} has been successfully updated`, "Update successful!");
      this.getVisitSummaryV2();
    }, () => {
      this.getVisitSummaryV2();
    });
  }

  /**
  * Publish Visit Summary V2 changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(() => {
      const name = this.visitSummaryV2Data?.find((v: FeatureModel) => v.key === 'visit_summary_v2_section')?.name;
      this.toastr.success(`${name} changes published successfully!`, "Changes published!");
    });
  }
}
