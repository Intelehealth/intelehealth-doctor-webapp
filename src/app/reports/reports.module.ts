import { CommonModule } from '@angular/common';
import { ReportsComponent } from './reports.component';
import { RouterModule, Routes } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ReportListComponent } from './report-list/report-list.component';


const routes: Routes = [
  {
    path: '',
    component: ReportsComponent
  },
];

@NgModule({
  declarations: [
    ReportsComponent,
    ReportListComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatTabsModule,
    MatExpansionModule,
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbNavModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatButtonModule,
    NgbNavModule,
    MatProgressBarModule,
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ReportsModule { }
