import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EpartogramRoutingModule } from './epartogram-routing.module';
import { EpartogramComponent } from './epartogram.component';
import { SharedModule } from '../shared.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';


@NgModule({
  declarations: [
    EpartogramComponent
  ],
  imports: [
    CommonModule,
    EpartogramRoutingModule,
    SharedModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatExpansionModule
  ]
})
export class EpartogramModule { }
