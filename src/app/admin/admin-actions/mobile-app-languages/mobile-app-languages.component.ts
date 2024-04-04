import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { isDefined } from '@ng-bootstrap/ng-bootstrap/util/util';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { MobileAppLanguageModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-mobile-app-languages',
  templateUrl: './mobile-app-languages.component.html',
  styleUrls: ['./mobile-app-languages.component.scss']
})
export class MobileAppLanguagesComponent implements OnInit {
  displayedColumns : string[] = ['id', 'name', 'default', 'updatedAt', 'active'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  mobileAppLangData : MobileAppLanguageModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configServce: ConfigService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.configServce.getMobileAppLanguages().subscribe(res=>{
      let dummyData = {
        data:[
          {id:1, name:"English", isActive: true, isDefault: false, updatedAt: "2024-04-01"},
          {id:1, name:"Hindi", isActive: true, isDefault: true, updatedAt: "2024-04-01"},
          {id:1, name:"Marathi", isActive: false, isDefault: false, updatedAt: "2024-04-01"},
        ]
      }
      this.mobileAppLangData = dummyData.data;
      this.dataSource = new MatTableDataSource(this.mobileAppLangData);
      this.dataSource.paginator = this.paginator;
    });
  }

  changeDefault(element:MobileAppLanguageModel){
    this.mobileAppLangData.forEach(obj=>obj.isDefault = false);
    element.isDefault = true;
  }
}
