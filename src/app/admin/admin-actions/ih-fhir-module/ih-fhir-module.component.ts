import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-ih-fhir-module',
  templateUrl: './ih-fhir-module.component.html',
  styleUrls: ['./ih-fhir-module.component.scss']
})
export class IhFhirModuleComponent {
  displayedColumns: string[] = ['id', 'name', 'platform', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  fhirData: any[] = [];
  private readonly moduleStatusIgnoredKeys = [
    'id',
    'name',
    'lang',
    'key',
    'platform',
    'updatedAt',
    'updated_at',
    'createdAt',
    'created_at',
    'is_editable',
    'is_enabled',
    'is_locked',
    'order',
    'sub_sections'
  ];

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
      this.refreshDataSource();
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
    const statusKey = this.resolveStatusKey(item);
    const isEnabled = typeof item?.[statusKey] === 'boolean'
      ? item[statusKey]
      : Boolean(item?.is_enabled);

    return {
      ...item,
      platform: item?.platform || 'Web',
      updatedAt: item?.updatedAt || item?.updated_at,
      statusKey,
      is_enabled: isEnabled
    };
  }

  private resolveStatusKey(item: any): string {
    if (typeof item?.key === 'string' && item.key.trim()) {
      return item.key.trim();
    }

    const normalizedName = (item?.name || '').toLowerCase();
    if (normalizedName.includes('shr')) {
      return 'shr';
    }
    if (normalizedName.includes('fhir')) {
      return 'fhir';
    }

    const dynamicKey = Object.keys(item || {}).find(
      key => !this.moduleStatusIgnoredKeys.includes(key) && typeof item[key] === 'boolean'
    );

    return dynamicKey || 'fhir';
  }

  updateStatus(element: any, status: boolean): void {
    if (element._updating) {
      return;
    }

    const previousStatus = element.is_enabled;
    element._updating = true;
    this.applyModuleStatus(element, status);

    this.configService.updateIhFhirModuleEnabledStatus(element.id, element.statusKey, status).subscribe({
      next: () => {
        element._updating = false;
        this.toastr.success('FHIR Module has been successfully updated', 'Update successful!');
        this.getFhirModule();
      },
      error: () => {
        element._updating = false;
        this.applyModuleStatus(element, previousStatus);
        this.toastr.error('FHIR Module could not be updated. Please try again.', 'Update failed!');
        this.getFhirModule();
      }
    });
  }

  private applyModuleStatus(element: any, status: boolean): void {
    element.is_enabled = status;
    if (element.statusKey) {
      element[element.statusKey] = status;
    }
    this.refreshDataSource();
  }

  private refreshDataSource(): void {
    this.dataSource.data = [...this.fhirData];
    this.dataSource.paginator = this.paginator;
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
