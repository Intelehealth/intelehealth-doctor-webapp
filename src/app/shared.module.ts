import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DefaultImageDirective } from './core/directives/default-image.directive';
import { MatTableResponsiveDirective } from './core/directives/mat-table-responsive.directive';

@NgModule({
  declarations: [NoValuePipe, DefaultImageDirective, MatTableResponsiveDirective],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [NoValuePipe, TranslateModule, DefaultImageDirective, MatTableResponsiveDirective]
})
export class SharedModule { }
