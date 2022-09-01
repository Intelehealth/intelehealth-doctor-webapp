import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslationService } from 'src/app/services/translation.service';

@Component({
  selector: 'app-modals',
  templateUrl: './modals.component.html',
  styleUrls: ['./modals.component.css']
})
export class ModalsComponent implements OnInit {
  file: any;
  mindmapUploadJson: any;
  minDate = new Date();
  constructor(@Inject(MAT_DIALOG_DATA) public data,
  private dialogRef: MatDialogRef<ModalsComponent>, private translationService: TranslationService) { }

  ngOnInit() {
    this.translationService.changeCssFile(localStorage.getItem("selectedLanguage"));
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

}
