import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpAndSupportRoutingModule } from './help-and-support-routing.module';
import { HelpAndSupportComponent } from './help-and-support.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  declarations: [
    HelpAndSupportComponent
  ],
  imports: [
    CommonModule,
    HelpAndSupportRoutingModule,
     MatTabsModule,
     MatExpansionModule
  ]
})
export class HelpAndSupportModule { }
