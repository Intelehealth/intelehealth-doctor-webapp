import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PdfViewComponent } from './pdf-view.component';

const routes: Routes = [
  {
    path: '',
    component: PdfViewComponent
  }
];

@NgModule({
  declarations: [PdfViewComponent],
  imports: [
    CommonModule,
    PdfViewerModule,
    RouterModule.forChild(routes)
  ]
})
export class PdfViewModule {}
