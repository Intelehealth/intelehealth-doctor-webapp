import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoValuePipe } from './core/pipes/no-value.pipe';
import { FillPipe } from './core/pipes/fill.pipe';
import { EmptyArrayPipe } from './core/pipes/empty-array.pipe';



@NgModule({
  declarations: [NoValuePipe, FillPipe, EmptyArrayPipe],
  imports: [
    CommonModule
  ],
  exports: [NoValuePipe, FillPipe, EmptyArrayPipe]
})
export class SharedModule { }
