import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DefaultImageDirective } from './core/directives/default-image.directive';
import { MatTableResponsiveDirective } from './core/directives/mat-table-responsive.directive';
import { CommonFileUploadModule } from './core/components/common-file-upload/common-file-upload.module';
@NgModule({
  declarations: [NoValuePipe, DefaultImageDirective, MatTableResponsiveDirective],
  imports: [
    CommonModule,
    TranslateModule,
    CommonFileUploadModule
  ],
  exports: [NoValuePipe, TranslateModule, DefaultImageDirective, MatTableResponsiveDirective, CommonFileUploadModule]
})
export class SharedModule { }
