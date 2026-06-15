import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { FacilityModuleConfigurationService } from 'src/app/services/facility-module-configuration.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { AddFacilityDialogComponent } from './add-facility-dialog/add-facility-dialog.component';

@Component({
  selector: 'app-facility-module',
  templateUrl: './facility-module.component.html',
  styleUrls: ['./facility-module.component.scss']
})
export class FacilityModuleComponent implements OnInit {
  modules: any[] = [];
  displayedColumns: string[] = ['id', 'facilityName', 'prescriptionApi', 'appointmentApi', 'action'];

  constructor(
    private dialog: MatDialog,
    private toastr: ToastrService,
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private facilityModuleConfigurationService: FacilityModuleConfigurationService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: 'Facility module configuration', imgUrl: 'assets/svgs/downloading.svg' });
    this.getFacilityConfigurationModule();
  }

  openAddFacilityDialog(): void {
    const dialogRef = this.dialog.open(AddFacilityDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFacilityConfigurationModule();
      }
    });
  }

  openEditFacilityDialog(module: any): void {
    const dialogRef = this.dialog.open(AddFacilityDialogComponent, {
      width: '400px',
      data: module
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getFacilityConfigurationModule();
      }
    });
  }

  getFacilityConfigurationModule(): void {
    this.facilityModuleConfigurationService.getFacilityConfigurationList().subscribe({
      next: (res: any) => {
        this.modules = Array.isArray(res) ? res : [];
      },
      error: err => {
        this.toastr.error(this.translateService.instant('Failed to get list of modules'));
        console.error('Error fetching facility module list:', err);
      }
    });
  }
}
