import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonFileUploadComponent } from './common-file-upload.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
  declarations: [CommonFileUploadComponent],
  imports: [
    CommonModule,
    TranslateModule,
    ToastrModule
  ],
  exports: [CommonFileUploadComponent]
})
export class CommonFileUploadModule { } 