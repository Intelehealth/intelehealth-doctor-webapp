import { ModalsComponent } from './modals/modals.component';
import { MindmapService } from '../../services/mindmap.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
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
    this.mindmapService.getMindmapKey().subscribe(
      (response) => {
        this.mindmaps = response.data;
      },
      (err) => {
        const message =
          err?.error?.message || err?.message || "Something went wrong";
        this.snackbar.open(message, null, {
          duration: 4000,
        });
      }
    );
  }

  addKey(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: {
        title: "Add License key",
        key: this.addKeyValue,
        expiryDate: this.newExpiryDate,
      },
      width: "250px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.addKeyValue = result.key;
      this.newExpiryDate = result.expiryDate;
      this.mindmapService.addUpdateLicenseKey(result).subscribe((response) => {
        if (response) {
          if (response.success) {
            this.snackbar.open(`Key Added`, null, { duration: 4000 });
            this.fetchMindmap();
          } else {
            const message = response.message || "Something went wrong.";
            this.snackbar.open(message, null, { duration: 4000 });
            this.addKeyValue = "";
          }
        }
      });
    });
  }

  addMindmap(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: "Add Mindmap", mindmapJson: this.mindmapUploadJson },
      width: "40%",
    });

    dialogRef.afterClosed().subscribe((result) => {
      const data = {
        filename: result.filename,
        value: result.mindmapJson,
        key: this.selectedKey,
      };
      this.mindmapService.postMindmap(data).subscribe(
        (res) => {
          this.snackbar.open(res.message, null, { duration: 4000 });
          this.licenceKeyHandler();
        },
        (err) =>
          this.snackbar.open("Something went Wrong", null, { duration: 4000 })
      );
    });
  }


  licenceKeyHandler(): void {
    this.mindmapService.detailsMindmap(this.selectedKey).subscribe(
      (response) => {
        this.mindmapData = response.data;
        this.dataSource = new MatTableDataSource(this.mindmapData);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        const { expiry, imageValue } = this.mindmaps.find(
          (m) => m.keyName === this.selectedKey
        );
        this.expiryDate = expiry;
        this.image = imageValue;
      },
      (err) =>
        this.snackbar.open("Something went Wrong", null, { duration: 4000 })
    );
  }

  editExpiryDate(): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: "Edit Expiry Date", expiryDate: this.expiryDate },
      width: "250px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      const newExpiryDate = result.expiryDate;
      this.mindmapService
        .addUpdateLicenseKey({
          key: this.selectedKey,
          expiryDate: newExpiryDate,
        })
        .subscribe(
          (response) => {
            if (response.success) {
              this.expiryDate = response?.data?.expiry;
            }
            this.snackbar.open(response.message, null, {
              duration: 4000,
            });
          },
          (err) => {
            const message =
              err?.error?.message || err?.message || "Something went wrong";
            this.snackbar.open(message, null, {
              duration: 4000,
            });
          }
        );
    });
  }

  editMindmap(index): void {
    console.log(index, this.mindmapData[index].name)
  }

  deleteMindmap(name): void {
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { title: "Delete Mindmap" },
      width: "250px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const mindmapName = name;
        this.mindmapService
          .deleteMindmap(this.selectedKey, { mindmapName })
          .subscribe(
            (response) => {
              if (response) {
                this.snackbar.open(response.message, null, {
                  duration: 4000,
                });
                this.licenceKeyHandler();
              }
            },
            (err) => {
              const message =
                err?.error?.message || err?.message || "Something went wrong";
              this.snackbar.open(message, null, {
                duration: 4000,
              });
            }
          );
      }
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

  imageUpload(): void {
    const data = {
      key: this.selectedKey,
      imageName: this.file.name,
      imageValue: this.mindmapUploadJson,
      type: "image",
    };
    this.mindmapService.addUpdateLicenseKey(data).subscribe((response) => {
      if (response) {
        this.mindmapUploadJson = "";
        this.image = response?.data?.imageValue;
        this.snackbar.open(response.message, null, { duration: 4000 });
        this.fetchMindmap();
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
