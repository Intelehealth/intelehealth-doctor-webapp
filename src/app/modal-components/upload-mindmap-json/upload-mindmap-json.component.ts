import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MindmapService } from 'src/app/services/mindmap.service';

@Component({
  selector: 'app-upload-mindmap-json',
  templateUrl: './upload-mindmap-json.component.html',
  styleUrls: ['./upload-mindmap-json.component.scss']
})
export class UploadMindmapJsonComponent {

  file: any;
  filename: string = '';
  jsonData: string = '';
  @ViewChild('hiddenFileInput', { static: false }) hiddenFileInput: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<UploadMindmapJsonComponent>,
  private mindmapService: MindmapService) { }

  close() {
    this.dialogRef.close(false);
  }

  onFilesDropped(event: any) {
    if (event.addedFiles.length) {
      this.file = event.addedFiles[0];
      this.filename = this.file.name;
      if (!this.filename.endsWith('.json')) {
        this.reset();
        alert("Please upload json file only.");
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.jsonData = fileReader.result.toString();
      }
      fileReader.onerror = (error) => {
        console.log(error);
        this.reset();
      }
      fileReader.readAsText(this.file, "UTF-8");
    }
  }

  onFileChanged(event: any) {
    if (event.target.files) {
      this.file = event.target.files[0];
      this.filename = this.file.name;
      if (!this.filename.endsWith('.json')) {
        this.reset();
        alert("Please upload json file only.");
        return;
      }
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.jsonData = fileReader.result.toString();
      }
      fileReader.onerror = (error) => {
        console.log(error);
        this.reset();
      }
      fileReader.readAsText(this.file, "UTF-8");
    }
  }

  reset() {
    this.file = undefined;
    this.filename = '';
    this.jsonData = '';
    this.hiddenFileInput.nativeElement.value = "";
  }

  uploadMindmap() {
    this.dialogRef.close({
      filename: this.filename,
      value: this.jsonData
    })
  }

}
