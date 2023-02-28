import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';



@NgModule({
  declarations: [NoValuePipe],
  imports: [
    CommonModule
  ],
  exports: [NoValuePipe]
})
export class SharedModule { }
