import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { PatientVisitSection } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-ih-fhir-module',
  templateUrl: './ih-fhir-module.component.html',
  styleUrls: ['./ih-fhir-module.component.scss']
})
export class IhFhirModuleComponent {
  displayedColumns: string[] = ['id', 'name', 'platform', 'updatedAt', 'fhir'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  fhirData: any[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configService: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: 'Admin Actions', imgUrl: 'assets/svgs/admin-actions.svg' });
    this.getFhirModule();
  }

  getFhirModule(): void {
    this.configService.getIhFhirModuleSections().subscribe((res: any) => {
      this.fhirData = this.getFhirModuleData(res);
      this.dataSource = new MatTableDataSource(this.fhirData);
      this.dataSource.paginator = this.paginator;
    });
  }

  private getFhirModuleData(res: any): any[] {
    if (Array.isArray(res)) {
      return res.map(item => this.normalizeFhirModule(item));
    }

    const data = res?.fhir_module
      || res?.ih_fhir_module
      || res?.ih_fhir_module_sections
      || res?.ih_fhir_modules
      || res?.fhir_modules
      || res?.data
      || [];

    return Array.isArray(data)
      ? data.map(item => this.normalizeFhirModule(item))
      : [this.normalizeFhirModule(data)];
  }

  private normalizeFhirModule(item: any): any {
    return {
      ...item,
      platform: item?.platform || 'Web',
      updatedAt: item?.updatedAt || item?.updated_at,
      fhir: item?.fhir
    };
  }

  updateStatus(id: number, status: boolean): void {
    this.configService.updateIhFhirModuleEnabledStatus(id, status).subscribe(res => {
      this.toastr.success('FHIR Module has been successfully updated', 'Update successful!');
      this.getFhirModule();
    }, err => {
      this.getFhirModule();
    });
  }

  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success('FHIR Module changes published successfully!', 'Changes published!');
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
