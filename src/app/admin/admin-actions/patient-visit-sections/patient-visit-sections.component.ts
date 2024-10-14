import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { PatientVisitSection } from 'src/app/model/model';
import { ConfigService } from 'src/app/services/config.service';
import { CoreService } from 'src/app/services/core/core.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-patient-visit-sections',
  templateUrl: './patient-visit-sections.component.html',
  styleUrls: ['./patient-visit-sections.component.scss']
})
export class PatientVisitSectionsComponent {
  displayedColumns : string[] = ['id', 'name', 'order', 'updatedAt', 'is_enabled'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatTable) table: MatTable<any>;

  sectionDatas: PatientVisitSection[];
  originalItems: PatientVisitSection[];
  
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
  }

  /**
  * Get patient vitals.
  * @return {void}
  */
  getPatientVisitSections(): void {
    this.configService.getPatientVisitSections().subscribe((res: any)=>{
      this.sectionDatas = res.patient_visit_sections;
      this.dataSource = new MatTableDataSource(this.sectionDatas);
    });
  }

  ngAfterViewInit() {
    this.getPatientVisitSections();
  }

  /**
  * Update Patient visit sections enabled status.
  * @return {void}
  */
  updateStatus(id: number, status: boolean): void {
    this.configService.updatePVSEnabledStatus(id, status).subscribe(res => {
      this.toastr.success("Patient visit sections has been successfully updated", "Update successful");
      this.getPatientVisitSections();
    }, err => {
      this.getPatientVisitSections();
    });
  }

  /**
  * Publish Patient visit sections changes.
  * @return {void}
  */
  onPublish(): void {
    this.configService.publishConfig().subscribe(res => {
      this.toastr.success("Patient visit sections changes published successfully!", "Changes published!");
    });
  }

  drop(event: CdkDragDrop<PatientVisitSection[]>) {
    const previousIndex = this.dataSource.data.findIndex(row => row === event.item.data);
    this.originalItems = [...this.dataSource.data];
    moveItemInArray(this.dataSource.data,previousIndex, event.currentIndex);
    const newOrder = this.dataSource.data.map((item, index) => ({
      id: item.id,
      order: index + 1 // Assuming order starts at 1
    }));

    // Update the order in the database
    this.updateOrder(newOrder);
  }

   // Function to update order in the database
   updateOrder(newOrder: any[]) {
    this.configService.updatePVSOrder(newOrder).subscribe({
      next: (res) => {
        this.toastr.success("Order updated successfully!");
        this.table.renderRows();
      },
      error: (err) => {
        this.dataSource.data = this.originalItems;
      }
    });
  }

  openDialog(element: { id: any; lang: any; }) {
    const id = element?.id;
    const data = { 
      fieldName: 'lang', // Example data to pass
      fieldValue:  element?.lang
    };
    const dialogRef = this.coreServce.openLanguageFieldModal({ data });

    // Capture the data from the output event emitter
    dialogRef.componentInstance.onSubmit.subscribe((result: string) => {
      this.configService.updatePVSName(id, result).subscribe(res => {
        dialogRef.close();
        this.toastr.success("Patient visit sections name updated successfully!");
        this.getPatientVisitSections();
      }, (error) => {
        dialogRef.close();
        this.toastr.error(error?.message);
      })
    });
  }
}
