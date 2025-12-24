import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MobileAppLanguageModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-mobile-app-languages',
  templateUrl: './mobile-app-languages.component.html',
  styleUrls: ['./mobile-app-languages.component.scss']
})
export class MobileAppLanguagesComponent implements OnInit {
  displayedColumns : string[] = ['id', 'name', 'platform', 'updatedAt', 'is_default', 'is_enabled'];
  platformChanges: { [id: number]: string } = {}; // key = element ID, value = platform

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  mobileAppLangData : MobileAppLanguageModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configServce: ConfigService,
    private toastr: ToastrService,
    private coreService: CoreService,

  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.getLanguages()
  }

  /**
  * Get languages.
  * @return {void}
  */
  getLanguages(): void {
    this.configServce.getAppLanguages().subscribe(res=>{
      this.mobileAppLangData = res.languages;
      this.dataSource = new MatTableDataSource(this.mobileAppLangData);
      this.dataSource.paginator = this.paginator;
    });
  }

  /**
  * Update language status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configServce.updateLanguageStatus(id, status).subscribe(res => {
      this.toastr.success("Mobile app language has been successfully updated","Update successful!");
      this.getLanguages();
    }, err => {
      this.getLanguages();
    });
  }

  changeDefault(id: number) {
    this.configServce.setAsDefaultLanguage(id).subscribe(res => {
      this.toastr.success("Mobile app language set as default successfully!","Update successful!");
      this.getLanguages();
    }, err => {
      this.getLanguages();
    });
  }

  /**
  * Publish langauge changes.
  * @return {void}
  */
  onPublish(): void {
    this.configServce.publishConfig().subscribe(res => {
      this.toastr.success("Mobile app language changes published successfully!", "Changes published!");
    });
  }

  /**
  * Open language field modal
  * @return {Observable<any>} - Dialog result
  */
openDialog(element): void {
  const id = element?.id;
   const data = {
    lang_name : element?.en_name || '',
    platform: element?.platform || 'Mobile' // Pass the selected or default
  };

  const dialogRef = this.coreService.openPlatformSelectionFieldModal({ data });

  dialogRef.componentInstance.onSubmit.subscribe((result: string) => {
    this.configServce.updatePlatform(id, result).subscribe(
      (res) => {
        element.platform = result; // Update the local data to reflect the change
        dialogRef.close();
        this.toastr.success(`Platform for ${element.en_name} is changed successfully.`);
      },
      (error) => {
        dialogRef.close();
        this.toastr.error(error?.message || 'Failed to update platform details.');
      }
    );
  });
}


}
