import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupFormComponent } from './popup-form/popup-form.component';
import { MindmapService } from "../../services/mindmap.service";

@Component({
  selector: 'app-admin-container',
  templateUrl: './admin-container.component.html',
  styleUrls: ['./admin-container.component.scss']
})
export class AdminContainerComponent implements OnInit {
  mindmaps = [];
  mindmapDatas = [];
  selectedLicense: string;
  expiryDate: string;
  LicenseList = [];
  addKeyValue: string;
  newExpiryDate: string;
  mindmapUploadJson: any;
  table: any = {
    headers: [
      { name: "Select", type: "fill", imageKey: "selectIcon",headerClass: "col-1" },
      { name: "Sr. No", type: "number", key: "sequence", headerClass: "col-1" },
      { name: "Patient", type: "stringwithimage", key: "patientName", headerClass: "patientName" },
      { name: "Last Updated", type: "string", key: "LastUpdated", headerClass: "lastUpdate" },
      { name: "Active", type: "boolean", imageKey: "ActiveStatusIcon", headerClass: "activeStatus" },
      { name: "Download", type: "file", imageKey: "DownloadIcon", headerClass: "download" },
      { name: "Info", type: "data", imageKey: "InfoDataIcon" },
    ]
  };
  constructor(
    private mindmapService: MindmapService,
    private matDialog: MatDialog
    ) { }

  ngOnInit(): void {
    this.fetchMindmaps();
  }

  fetchMindmaps(): void {
    this.mindmapService.getMindmapKey().subscribe(
      (response) => {
        this.mindmaps = response.data;
        this.selectedLicense = this.mindmaps[0].keyName
        this.licenceKeySelecter()
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

  addKey(){
    const dialogRef = this.matDialog.open(PopupFormComponent,{
      data: {
        title: "Add new key",
        key: this.addKeyValue,  
        expiryDate: this.newExpiryDate,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.addKeyValue = result.key;
      this.newExpiryDate = result.expiryDate;
      this.mindmapService.addUpdateLicenseKey(result).subscribe((response) => {
        if (response) {
          if (response.success) {
            this.fetchMindmaps();
          } else {
            const message = response.message || "Something went wrong.";
            console.log(message);
            this.addKeyValue = "";
          }
        }
      });
    });
  }

  addMindmap(){
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
        (err) =>{
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

}

