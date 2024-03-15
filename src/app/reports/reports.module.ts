import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsComponent } from './reports.component';
import { ReportListComponent } from './report-list/report-list.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ModalService } from './services/modal.service';
import { ReportsSuccessComponent } from './modals/reports-success/reports-success.component';
import { ReportErrorComponent } from './modals/reports-error/reports-error.component';
import { FileDownloadComponent } from './modals/file-download/file-download.component';



@NgModule({
  declarations: [
    ReportsComponent,
    ReportListComponent,
    ReportsSuccessComponent,
    ReportErrorComponent,
    FileDownloadComponent 
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    NgbNavModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    MatTableModule,
    MatButtonModule,
    NgbNavModule,
    MatProgressBarModule,
  ],
  providers: [
    ModalService
  ]
})
export class ReportsModule { }
