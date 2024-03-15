import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DefaultImageDirective } from './core/directives/default-image.directive';

@NgModule({
  declarations: [NoValuePipe, DefaultImageDirective],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [NoValuePipe, TranslateModule, DefaultImageDirective]
})
export class SharedModule { }
