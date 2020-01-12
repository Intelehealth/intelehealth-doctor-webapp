import { ModalsComponent } from './modals/modals.component';
import { MindmapService } from '../../services/mindmap.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar, MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

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
      const keys = response.data.licensekey;
      keys.forEach(key => {
        const values = {
          keys : Object.keys(key)[0],
          value : {}
        };
        values.value[Object.keys(key)[0]] = Object.values(key)[0];
        this.mindmaps.push(values);
      });
    });
  }

  addKey(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: {title: 'Add License key', key: this.addKeyValue, expiryDate: this.newExpiryDate},
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.addKeyValue = result.key;
      this.newExpiryDate = result.expiryDate;
      this.mindmapService.addLicenseKey(result)
      .subscribe(response => {
        if (response) {
          if (response.message === 'Key already Present') {
            this.snackbar.open(`Key Added Exist`, null, {duration: 4000});
            this.addKeyValue = '';
          } else {
            this.snackbar.open(`Key Added`, null, {duration: 4000});
            setTimeout(() => window.location.reload(), 1000);
          }
        }
      });
    });
  }

  addMindmap(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: {title: 'Add Mindmap', mindmapJson: this.mindmapUploadJson},
      width: '40%'
    });

    dialogRef.afterClosed().subscribe(result => {
      const data = {
        filename: result.filename,
        value: result.mindmapJson,
        key: this.selectedKey
      };
      console.log(data)
      this.mindmapService.postMindmap(data)
      .subscribe(res => {
        if (res) {
          this.snackbar.open(`Added Successfully`, null, {duration: 4000});
        } else {
          this.snackbar.open(`Something went Wrong`, null, {duration: 4000});
        }
      });
    });
  }


  licenceKeyHandler(): void {
    this.mindmapService.detailsMindmap(this.selectedKey)
    .subscribe(response => {
      this.mindmapData = response.datas;
      this.expiryDate = response.expiry;
      this.image = response.image;
      this.dataSource = new MatTableDataSource(this.mindmapData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  editExpiryDate(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: {title: 'Edit Expiry Date', expiryDate: this.expiryDate},
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      const newExpiryDate = result.expiryDate;
      this.mindmapService.editExpiryDate(this.selectedKey, {newExpiryDate})
      .subscribe(response => {
        if (response) {
          this.expiryDate = response.updatedDate;
        }
      });
    });
  }

  editMindmap(index): void {
    console.log(index, this.mindmapData[index].name)
  }

  deleteMindmap(index): void {
    const mindmapName = this.mindmapData[index].name;
    this.mindmapService.deleteMindmap(this.selectedKey, {mindmapName})
    .subscribe(response => {
      console.log(response)
    });
  }

  fileHandler (event) {
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

  imageUpload() {
    const data = {
      filename: this.file.name,
      value: this.mindmapUploadJson
    };
    this.mindmapService.updateImage(this.selectedKey, this.image.image_name, data)
    .subscribe(response => {
      if (response) {
        this.mindmapUploadJson = '';
        this.image.image_file = data.value;
        this.snackbar.open(`Image Updated`, null, {duration: 4000});
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
