import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ConfigService } from 'src/app/services/config.service';
import { compare, getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';
import { MatSort, Sort } from '@angular/material/sort';
import { PatientRegistrationFieldsModel } from 'src/app/model/model';
import * as moment from 'moment';


@Component({
  selector: 'app-patient-registration',
  templateUrl: './patient-registration.component.html',
  styleUrls: ['./patient-registration.component.scss']
})
export class PatientRegistrationComponent {
  displayedColumns : string[] = ['id', 'name', 'updatedAt', 'is_mandatory', 'is_editable','is_enabled'];
  tabList = ['Personal', 'Address', 'Other'];
  currentTabIndex = 0; 
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  patientFieldsData : any;
  sortedData : PatientRegistrationFieldsModel[];
  selectedSort: any; 
  sortOptions = [ 
                  {colName:"name",label:"Field Title"},
                  {colName:"updatedAt",label:"Last Updated"},                  
                  {colName:"is_enabled",label:"Active"},
                  {colName:"is_mandatory",label:"Mandatory Fields"},
                ];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configServce: ConfigService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
  }

  ngAfterViewInit(){
    this.getAllFields();
  }

  onTabChange(tabIndex){
    this.currentTabIndex = tabIndex;
    this.paginator.pageIndex = 0;
    this.sort.sort({id: '', start: 'asc', disableClear: false});
    this.sortDataAndUpdate();
  }

  /**
  * Get patient registration fields.
  * @return {void}
  */
  getAllFields(): void {
    this.configServce.getPatientRegistrationFields().subscribe(res=>{
      this.patientFieldsData = res.patient_registration;
      this.sortDataAndUpdate();
    }, err => {
      
    });
  }

  /**
  * Update Field status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configServce.updatePatientRegistrationStatus(id, status).subscribe(res => {
      this.toastr.success("Patient Registration has been successfully updated","Update successful!");
      this.getAllFields();
    }, err => {
      this.getAllFields();
    });
  }

  /**
  * Update Mandatory Field status.
  * @return {void}
  */
  updateMandatoryStatus(id: number, status: boolean): void {
    this.configServce.updatePatientRegistrationMandatoryStatus(id, status).subscribe(res => {
      this.toastr.success("Patient Registration has been successfully updated","Update successful!");
      this.getAllFields();
    }, err => {
      this.getAllFields();
    });
  }

  /**
  * Update Editable Field status.
  * @return {void}
  */
  updateEditStatus(id: number, status: boolean): void {
    this.configServce.updatePatientRegistrationEditableStatus(id, status).subscribe(res => {
      this.toastr.success("Patient Registration has been successfully updated","Update successful!");
      this.getAllFields();
    }, err => {
      this.getAllFields();
    });
  }

  /**
  * Publish langauge changes.
  * @return {void}
  */
  onPublish(): void {
    this.configServce.publishConfig().subscribe(res => {
      this.toastr.success("Patient Registration changes published successfully!", "Changes published!");
    });
  }

  sortDataAndUpdate(sortOption = null){
    this.sortData(sortOption);
    this.dataSource = new MatTableDataSource(this.sortedData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  sortData(sortOption) {
    const currTabName = this.tabList[this.currentTabIndex].toLocaleLowerCase();
    const data = this.patientFieldsData[currTabName]?.slice();
    if (!sortOption) {
      this.sortedData = data;
      this.sortOptions.forEach(e=>e['direction']=null);
      return;
    }
    switch(sortOption.direction){
      case 'asc':
        sortOption['direction'] = 'desc';
        break;
      case 'desc':
        sortOption['direction'] = null;
        this.sortedData = data;
        return;
      default:
        sortOption['direction'] = 'asc';
        break;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sortOption.direction === 'asc';
      switch (sortOption.colName) {
        case 'name':
          return compare(a.name, b.name, isAsc);
        case 'updatedAt':
          return compare(moment(a.updatedAt).unix(), moment(b.updatedAt).unix(), isAsc);
        case 'is_mandatory':
          return compare(+(a.is_mandatory), +(b.is_mandatory), isAsc);
        case 'is_enabled':
          return compare(+(a.is_enabled), +(b.is_enabled), isAsc);
        default:
          return 0;
      }
    });
  }
}
