import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpAndSupportRoutingModule } from './help-and-support-routing.module';
import { HelpAndSupportComponent } from './help-and-support.component';


@NgModule({
  declarations: [
    HelpAndSupportComponent
  ],
  imports: [
    CommonModule,
    HelpAndSupportRoutingModule
  ]
})
export class HelpAndSupportModule { }
