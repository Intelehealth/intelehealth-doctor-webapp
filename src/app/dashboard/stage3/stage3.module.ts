import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Stage3RoutingModule } from './stage3-routing.module';
import { Stage3Component } from './stage3.component';
import { SharedModule } from '../../shared.module';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [Stage3Component],
  imports: [
    CommonModule,
    FormsModule,
    Stage3RoutingModule,
    SharedModule,
    MatExpansionModule,
    MatIconModule
  ]
})
export class Stage3Module { }
