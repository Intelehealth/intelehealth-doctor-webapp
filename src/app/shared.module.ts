import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { FillPipe } from './core/pipes/fill.pipe';



@NgModule({
  declarations: [NoValuePipe, FillPipe],
  imports: [
    CommonModule
  ],
  exports: [NoValuePipe, FillPipe]
})
export class SharedModule { }
