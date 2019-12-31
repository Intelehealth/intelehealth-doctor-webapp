import { MindmapService } from '../../services/mindmap.service';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-ayu',
  templateUrl: './ayu.component.html',
  styleUrls: ['./ayu.component.css']
})
export class AyuComponent implements OnInit {
  file: any;
  mindmaps = [];
  value: string;
  mindmapUploadJson: any;
  mindmapKeyFilesName: any;
  add = false;
  addKeyValue = '';
  choose = false;
  type = '';

  constructor(private mindmapService: MindmapService,
              private snackbar: MatSnackBar) { }

  ngOnInit() {
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

  addHandler() {
    this.add = true;
    this.choose = false;
  }

  chooseHandler() {
    this.add = false;
    this.choose = true;
  }

  licenceKeyHandler() {
    this.mindmaps.forEach(mindmap => {
      if (mindmap.keys === this.value) {
        this.mindmapKeyFilesName = mindmap.value[this.value];
      }
    });
  }

  fileHandler (event) {
    this.file = event.target.files[0];
    this.saveUpload();
  }

  uploadDocument(type) {
    this.type = type;
    const fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
    fileUpload.click();
  }

  saveUpload() {
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.mindmapUploadJson = fileReader.result;
    };
    this.type === 'image' ? fileReader.readAsDataURL(this.file) : fileReader.readAsText(this.file);
  }

  upload() {
    const data = {
      filename: this.file.name,
      value: this.mindmapUploadJson,
      key: this.add ? this.addKeyValue : this.value
    };
    this.mindmapService.postMindmap(data)
    .subscribe(res => {
      if (res) {
        this.snackbar.open(`Added Successfully`, null, {duration: 4000});
      } else {
        this.snackbar.open(`Something went Wrong`, null, {duration: 4000});
      }
    });
  }
}
