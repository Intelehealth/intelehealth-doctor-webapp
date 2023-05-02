import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PrescriptionRoutingModule } from './prescription-routing.module';
import { PrescriptionComponent } from './prescription.component';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { SentComponent } from './sent/sent.component';
import { CompletedComponent } from './completed/completed.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from '../shared.module';


@NgModule({
  declarations: [
    PrescriptionComponent,
    SentComponent,
    CompletedComponent
  ],
  imports: [
    CommonModule,
    PrescriptionRoutingModule,
    NgbNavModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatPaginatorModule,
    SharedModule
  ]
})
export class PrescriptionModule { }
