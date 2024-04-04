import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { DoctorSpecialityModel } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-doctor-speciality',
  templateUrl: './doctor-speciality.component.html',
  styleUrls: ['./doctor-speciality.component.scss']
})
export class DoctorSpecialityComponent implements OnInit {
  displayedColumns : string[] = ['id', 'specialization', 'doctorsMapped', 'updatedAt', 'active'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  specialityData : DoctorSpecialityModel[];

  constructor(
    private pageTitleService: PageTitleService,
    private translateService: TranslateService,
    private configServce: ConfigService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.configServce.getDoctorSpecialities().subscribe(res=>{
      let dummyData = {
        data:[
          {id:1, specialization:"General Physician", doctorsMapped:5, isActive: true, updatedAt: "2024-04-01"},
          {id:1, specialization:"Gynecologist", doctorsMapped:3, isActive: false, updatedAt: "2024-04-01"},
          {id:1, specialization:"Pediatrician", doctorsMapped:1, isActive: true, updatedAt: "2024-04-01"},
        ]
      }
      this.specialityData = dummyData.data;
      this.dataSource = new MatTableDataSource(this.specialityData);
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  /**
  * Publish doctor speciality changes.
  * @return {void}
  */
  onPublish() {
    console.log(this.specialityData)
  }
}
