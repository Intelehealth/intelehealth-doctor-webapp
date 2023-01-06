import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PopupFormComponent } from 'src/app/component/admin-container/popup-form/popup-form.component';
import { MindmapService } from 'src/app/services/mindmap.service';
import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CoreService } from 'src/app/services/core/core.service';

@Component({
  selector: 'app-ayu',
  templateUrl: './ayu.component.html',
  styleUrls: ['./ayu.component.scss']
})
export class AyuComponent implements OnInit {

  displayedColumns: string[] = ['select', 'id', 'name', 'updatedAt', 'active', 'download', 'info'];
  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(false, []);
  @ViewChild(MatPaginator) paginator: MatPaginator;

  mindmaps = [];
  mindmapDatas = [];
  selectedLicense: string;
  expiryDate: string;
  LicenseList = [];
  addKeyValue: string;
  newExpiryDate: string;
  mindmapUploadJson: any;

  constructor(private mindmapService: MindmapService, private matDialog: MatDialog, private snackbar: MatSnackBar, private coreService: CoreService) { }

  ngOnInit(): void {
    this.fetchMindmaps();
  }

  downloadMindmap(json: string, name: string) {
    let sJson = JSON.stringify(JSON.parse(json));
    let element = document.createElement('a');
    element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
    element.setAttribute('download', name);
    element.click();
  }

  fetchMindmaps(): void {
    this.mindmapService.getMindmapKey().subscribe(
      (response) => {
        this.mindmaps = response.data;
        this.selectedLicense = this.mindmaps[0].keyName
        this.licenceKeySelecter();
      },
      (err) => {
        console.log("Something went wrong");
      }
    );
  }


  licenceKeySelecter(): void {
    this.mindmapService.detailsMindmap(this.selectedLicense).subscribe(
      (response) => {
        this.mindmapDatas = response.data;
        this.dataSource = new MatTableDataSource(this.mindmapDatas);
        this.dataSource.paginator = this.paginator;
        const { expiry } = this.mindmaps.find(
          (m) => m.keyName === this.selectedLicense
        );
        this.expiryDate = expiry;
      },
      (err) => {
        console.log("Something went wrong");
      }
    );
  }

  openAddLicenseKeyModal(mode: string) {
    let licKey = this.mindmaps.find((m) => m.keyName === this.selectedLicense);
    this.coreService.openAddLicenseKeyModal((mode == 'edit') ? licKey : null ).subscribe((result: any) => {
      if (result) {
        if (mode == 'edit') {
          this.mindmaps.forEach(m => {
            if (m.keyName == result.keyName) {
              m = result;
              this.expiryDate = result.expiry;
            }
          });
        } else {
          this.mindmaps.push(result);
        }
        this.snackbar.open(`License Key ${mode == 'add' ? 'Added' : 'Updated' } Successfully!`, null, {
          duration: 4000,
        });
      }
    });
  }

  addMindmap() {
    const dialogRef = this.matDialog.open(PopupFormComponent, {
      data: {
        title: "Add Mindmaps",
        mindmapJson: this.mindmapUploadJson
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      const data = {
        filename: result.filename,
        value: result.mindmapJson,
        key: this.selectedLicense,
      };
      this.mindmapService.postMindmap(data).subscribe(
        (res) => {
          console.log(res.message);
          this.licenceKeySelecter();
        },
        (err) => {
          console.log('somethingWentWrong');
        }
      );
    });
  }

  editExpiryDate(): void {
    const dialogRef = this.matDialog.open(PopupFormComponent, {
      data: { title: "Edit Expiry Date", expiryDate: this.expiryDate },
    });

    dialogRef.afterClosed().subscribe((result) => {
      const newExpiryDate = result.expiryDate;
      this.mindmapService
        .addUpdateLicenseKey({
          key: this.selectedLicense,
          expiryDate: newExpiryDate,
        })
        .subscribe(
          (response) => {
            if (response.success) {
              this.expiryDate = response?.data?.expiry;
            }
            console.log(response.message)
          },
          (err) => {
            const message = err?.error?.message || err?.message || "Something went wrong";
            console.log(message);
          }
        );
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  deleteMindmap() {
    this.mindmapService.deleteMindmap(this.selection.selected[0].keyName, { mindmapName: this.selection.selected[0].name })
    .subscribe((res: any) => {
      if (res) {
        this.snackbar.open(res.message, null, {
          duration: 4000,
        });
        this.selection.clear();
        this.licenceKeySelecter();
      }
    });
  }

  clearSelection() {
    this.selection.clear();
  }

}
