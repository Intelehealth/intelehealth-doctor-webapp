import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-translate',
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss']
})
export class TranslateComponent implements OnInit {

  submitted: boolean = false;
  languages: any = [
    {
      id: 1,
      name: 'Russian'
    },
    {
      id: 2,
      name: 'Hindi'
    },
    {
      id: 3,
      name: 'Marathi'
    }
  ];
  translateForm: FormGroup;
  file: any;

  constructor(private toastr: ToastrService, private http: HttpClient) {
    this.translateForm = new FormGroup({
      language: new FormControl('Russian', Validators.required)
    });
  }

  ngOnInit(): void {
  }

  get f() { return this.translateForm.controls; }

  translate() {
    this.submitted = true;
    if (this.translateForm.invalid) {
      this.toastr.warning('Please select language');
      return;
    }
    if (!this.file) {
      this.toastr.warning('Please upload input file');
      return;
    }
    let formdata = new FormData();
    formdata.append('file', this.file);
    formdata.append('language', this.translateForm.value.language);
    this.http.post(`https://demoai.intelehealth.org:3004/api/openai/translatexl`, formdata, { responseType: 'arraybuffer' }).subscribe((res:any) => {
      let blob = new Blob([res], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
      var downloadURL = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "translated.xlsx";
      link.click();
      this.toastr.success('Translation successful');
      this.file = null;
      this.submitted = false;
      this.translateForm.reset({ language: 'Russian' })
    });
  }

  onFilesDropped(event: any) {
    if (event.addedFiles.length) {
      this.file = event.addedFiles[0];
    }
    if (event.rejectedFiles.length) {
      if (event.rejectedFiles[0].reason == 'size') {
        this.toastr.error('Upload a file having size (5kb to 50kb)', 'Invalid File!');
      }
      if (event.rejectedFiles[0].reason == 'type') {
        this.toastr.error('Upload a file having type xlsx only.', 'Invalid File!');
      }
    }
  }

}
