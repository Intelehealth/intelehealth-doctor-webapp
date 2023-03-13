import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrescriptionDownloadComponent } from './prescription-download.component';
import { RouterModule, Routes } from '@angular/router';
import { ModalComponentsModule } from 'src/app/modal-components/modal-components.module';

const routes: Routes = [
  {
    path: '',
    component: PrescriptionDownloadComponent
  },
];


@NgModule({
  declarations: [
    PrescriptionDownloadComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ModalComponentsModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
  exports: [PrescriptionDownloadComponent]
})
export class PrescriptionDownloadModule { }
