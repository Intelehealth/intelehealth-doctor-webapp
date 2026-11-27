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
  selector: 'app-qms',
  templateUrl: './qms.component.html',
  styleUrls: ['./qms.component.scss']
})
export class QmsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'platform', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  qmsData: FeatureModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getQms();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Get the QMS feature config.
  * @return {void}
  */
  getQms(): void {
    this.configService.getFeatures().subscribe(res => {
      this.qmsData = res.feature?.filter((v: FeatureModel) => v.key === 'qms_section');
      this.dataSource = new MatTableDataSource(this.qmsData);
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
  * Update QMS status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(() => {
      const name = this.qmsData?.find((v: FeatureModel) => v.id === id)?.name;
      this.toastr.success(`${name} has been successfully updated`, "Update successful!");
      this.getQms();
    }, () => {
      this.getQms();
    });
  }

  /**
  * Publish QMS changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(() => {
      const name = this.qmsData?.find((v: FeatureModel) => v.key === 'qms_section')?.name;
      this.toastr.success(`${name} changes published successfully!`, "Changes published!");
    });
  }
}
