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
  selector: 'app-ncd',
  templateUrl: './ncd.component.html',
  styleUrls: ['./ncd.component.scss']
})
export class NcdComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'name', 'platform', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ncdData: FeatureModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getNcd();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Get the NCD Screening feature config.
  * @return {void}
  */
  getNcd(): void {
    this.configService.getFeatures().subscribe(res => {
      this.ncdData = res.feature?.filter((v: FeatureModel) => v.key === 'ncd_section');
      this.dataSource = new MatTableDataSource(this.ncdData);
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
  * Update NCD Screening status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateFeatureEnabledStatus(id, status).subscribe(() => {
      const name = this.ncdData?.find((v: FeatureModel) => v.id === id)?.name;
      this.toastr.success(`${name} has been successfully updated`, "Update successful!");
      this.getNcd();
    }, () => {
      this.getNcd();
    });
  }

  /**
  * Publish NCD Screening changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(() => {
      const name = this.ncdData?.find((v: FeatureModel) => v.key === 'ncd_section')?.name;
      this.toastr.success(`${name} changes published successfully!`, "Changes published!");
    });
  }
}
