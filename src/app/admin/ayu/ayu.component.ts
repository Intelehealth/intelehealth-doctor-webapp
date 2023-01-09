import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
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

  constructor(private mindmapService: MindmapService, private matDialog: MatDialog, private snackbar: MatSnackBar, private coreService: CoreService) { }

  ngOnInit(): void {
    this.fetchMindmaps();
  }

  /** Download JSON mindmap. */
  downloadMindmap(json: string, name: string) {
    let sJson = JSON.stringify(JSON.parse(json));
    let element = document.createElement('a');
    element.setAttribute('href', "data:text/json;charset=UTF-8," + encodeURIComponent(sJson));
    element.setAttribute('download', name);
    element.click();
  }

  /** Get lsit of available license keys. */
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

  /** Get lsit of available mindmaps for the selected license key. */
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

  /** Open Upload Json Mindmap Modal. */
  openUploadMindmapModal() {
    this.coreService.openUploadMindmapModal().subscribe((result: any) => {
      if (result) {
        if (result.filename && result.value) {
          result.key = this.selectedLicense;
          this.mindmapService.postMindmap(result).subscribe((res: any) => {
            if (res.success) {
              this.mindmapDatas.push(res.data);
              this.dataSource = new MatTableDataSource(this.mindmapDatas);
              this.dataSource.paginator = this.paginator;
              this.snackbar.open('Mindmap Added Successfully!', null, {
                duration: 4000
              });
            }
          });
        }
      }
    });
  }

  /** Open the Add/Edit License Key Modal. */
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

  /** Delete selected mindmap protocol. */
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

  /** Toggle status selected mindmap protocol. */
  toggleStatus(mindmap: any) {
    this.mindmapService.toggleMindmapStatus({ mindmapName: mindmap.name, keyName: mindmap.keyName })
    .subscribe((res: any) => {
      if (res.success) {
        this.snackbar.open(res.message, null, {
          duration: 4000,
        });
      }
    });
  }

  clearSelection() {
    this.selection.clear();
  }

}
