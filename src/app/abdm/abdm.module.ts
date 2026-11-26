import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared.module';
import { VisitCareContextComponent } from './visit-care-context/visit-care-context.component';

/**
 * ABDM M2 feature module (care-context / HI type sharing).
 * Import it in any feature module whose pages use AbdmService (currently DashboardModule).
 */
@NgModule({
  declarations: [VisitCareContextComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatTabsModule,
    MatCheckboxModule,
    MatIconModule,
    SharedModule,
  ],
})
export class AbdmModule { }
