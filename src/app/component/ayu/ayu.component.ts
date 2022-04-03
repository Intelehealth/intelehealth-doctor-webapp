import { ModalsComponent } from './modals/modals.component';
import { MindmapService } from '../../services/mindmap.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-ayu',
  templateUrl: './ayu.component.html',
  styleUrls: ['./ayu.component.css']
})
export class AyuComponent implements OnInit {
  displayColumns: string[] = ['id', 'name', 'lastUpdate', 'action'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource;
  file: any;
  mindmaps = [];
  mindmapData = [];
  selectedKey: string;
  image: any;
  mindmapUploadJson: any;
  mindmapKeyFilesName: any;
  addKeyValue: string;
  newExpiryDate: string;
  expiryDate: string;

  constructor(private mindmapService: MindmapService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.fetchMindmap();
  }

  fetchMindmap(): void {
    this.mindmapService.getMindmapKey()
      .subscribe(response => {
        this.mindmaps = response.data;
      }, err => this.snackbar.open('Error fetching Mindmap keys', null, { duration: 4000 }));
  }

  addKey(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: 'Add License key', key: this.addKeyValue, expiryDate: this.newExpiryDate },
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.addKeyValue = result.key;
      this.newExpiryDate = result.expiryDate;
      this.mindmapService.addLicenseKey(result)
        .subscribe(response => {
          if (response) {
            if (response.message === 'Key already Present') {
              this.snackbar.open(`Key already Present`, null, { duration: 4000 });
              this.addKeyValue = '';
            } else {
              this.snackbar.open(`Key Added`, null, { duration: 4000 });
              setTimeout(() => window.location.reload(), 1000);
            }
          }
        });
    });
  }

  addMindmap(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: 'Add Mindmap', mindmapJson: this.mindmapUploadJson },
      width: '40%'
    });

    dialogRef.afterClosed().subscribe(result => {
      const data = {
        filename: result.filename,
        value: result.mindmapJson,
        key: this.selectedKey
      };
      this.mindmapService.postMindmap(data)
        .subscribe(res => {
          this.snackbar.open(res.message, null, { duration: 4000 });
          this.licenceKeyHandler();
        }, err => this.snackbar.open('Something went Wrong', null, { duration: 4000 }));
    });
  }


  licenceKeyHandler(): void {
    this.mindmapService.detailsMindmap(this.selectedKey)
      .subscribe(response => {
        this.mindmapData = response.datas;
        this.expiryDate = response.expiry;
        const image = response.image || {};
        this.image = Object.keys(image).length ? response.image : undefined;
        this.dataSource = new MatTableDataSource(this.mindmapData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, err => this.snackbar.open('Something went Wrong', null, { duration: 4000 }));
  }

  editExpiryDate(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: 'Edit Expiry Date', expiryDate: this.expiryDate },
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      const newExpiryDate = result.expiryDate;
      this.mindmapService.editExpiryDate(this.selectedKey, { newExpiryDate })
        .subscribe(response => {
          this.expiryDate = response.updatedDate;
          this.snackbar.open(`Expiry date updated`, null, { duration: 4000 });
        }, err => this.snackbar.open(`Expiry date not updated`, null, { duration: 4000 }));
    });
  }

  editMindmap(index): void {
    console.log(index, this.mindmapData[index].name);
  }

  deleteMindmap(name): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: 'Delete Mindmap' },
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const mindmapName = name;
        this.mindmapService.deleteMindmap(this.selectedKey, { mindmapName })
          .subscribe(response => {
            if (response) {
              this.snackbar.open(`Mindmap deleted sucessfully`, null, { duration: 4000 });
              this.licenceKeyHandler();
            }
          }, err => this.snackbar.open(`Mindmap not deleted`, null, { duration: 4000 }));
      }
    });
  }

  fileHandler(event) {
    this.file = event.target.files[0];
    this.saveUpload();
  }

  uploadDocument() {
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.click();
  }

  saveUpload() {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.mindmapUploadJson = fileReader.result;
    };
    fileReader.readAsDataURL(this.file);
  }

  imageUpdate(): void {
    const data = {
      filename: this.file.name,
      value: this.mindmapUploadJson
    };
    this.mindmapService.updateImage(this.selectedKey, this.image.image_name, data)
      .subscribe(response => {
        if (response) {
          this.mindmapUploadJson = '';
          this.image.image_file = data.value;
          this.snackbar.open(`Image Updated`, null, { duration: 4000 });
        }
      });
  }

  imageUpload(): void {
    const data = {
      key: this.selectedKey,
      filename: this.file.name,
      value: this.mindmapUploadJson
    };
    this.mindmapService.uploadImage(data)
      .subscribe(response => {
        if (response) {
          this.mindmapUploadJson = '';
          this.image = {};
          this.image.image_file = data.value;
          this.snackbar.open('Image Uploaded', null, { duration: 4000 });
        }
      });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
