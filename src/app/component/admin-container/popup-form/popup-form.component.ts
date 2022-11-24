import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-popup-form',
  templateUrl: './popup-form.component.html',
  styleUrls: ['./popup-form.component.scss']
})
export class PopupFormComponent implements OnInit {
  file: any;
  mindmapUploadJson: any;
  minDate = new Date();
  onShowHideUpload: boolean = false;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<PopupFormComponent>) { }

  ngOnInit() {
  }

  close(): void {
    this.dialogRef.close();
  }

  fileHandler(event) {
    this.file = event.target.files[0];
    this.saveUpload();
  }

  uploadMindmap() {
    const mindmapUpload = document.getElementById('mindmapUpload') as HTMLInputElement;
    mindmapUpload.click();
  }

  saveUpload() {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.mindmapUploadJson = fileReader.result;
      this.data.mindmapJson = fileReader.result;
      this.data.filename = this.file.name;
    };
    fileReader.readAsText(this.file);
  }

  onToggleNext(){
    this.onShowHideUpload = true;
  }
}
