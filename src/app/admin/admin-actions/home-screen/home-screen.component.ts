import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { FeatureModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData, getFieldValueByLanguage } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})

export class HomeScreenComponent {

  displayedColumns: string[] = ['id', 'name', 'platform', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  data: FeatureModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private coreServce: CoreService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getHomeScreenFields();
  }

  /**
  * Get patient details sections.
  * @return {void}
  */
  getHomeScreenFields(): void {
    this.configService.getHomeScreenFields().subscribe(res => {
      this.data = res.home_screen_sections;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Update patient details status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updateHomeScreenEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Patient details have been successfully updated", "Update successful!");
      this.getHomeScreenFields();
    }, err => {
      this.getHomeScreenFields();
    });
  }

  /**
  * Publish patient details changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Patient details changes published successfully!", "Changes published!");
    });
  }

  /**
  * Open language field modal
  * @return {Observable<any>} - Dialog result
  */
  openDialog(element: { id: any; lang: any; }) {
    const id = element?.id;
    const data = { 
      fieldName: 'lang', // Example data to pass
      fieldValue:  element?.lang
    };
    const dialogRef = this.coreServce.openLanguageFieldModal({ data });

    // Capture the data from the output event emitter
    dialogRef.componentInstance.onSubmit.subscribe((result: string) => {
      this.configService.updateHomeScreenName(id, result).subscribe(res => {
        dialogRef.close();
        this.toastr.success("Home screen sections name updated successfully!");
        this.getHomeScreenFields();
      }, (error) => {
        dialogRef.close();
        this.toastr.error(error?.message);
      })
    });
  }

  /**
  * Retrieve the appropriate language value from an element.
  * @param {any} element - An object containing `lang` and `name`.
  * @return {string} - The value in the selected language or the first available one.
  * Defaults to `element.name` if no language value is found.
  */
  getLanguageValue(element: any) {
    return getFieldValueByLanguage(element);
  }

  /**
   * Retrieve the appropriate platform name based on the platform value.
   * @param {string} platformValue - The platform identifier ('0', '1', or '2').
   * @return {string} - The platform name: 'Mobile', 'Webapp', or 'Both'.
   * Defaults to 'Unknown' if the platform value is not recognized.
   */
  getPlatform(platformValue: string): string {
    return platformValue === '0' ? 'Mobile' : platformValue === '1' ? 'Webapp' : platformValue === '2' ? 'Both' : 'Unknown';
  }
}

