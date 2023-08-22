import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [NoValuePipe],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [NoValuePipe, TranslateModule]
})
export class SharedModule { }
