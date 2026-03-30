import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
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
    HttpClientModule,
    RouterModule.forChild(routes)
  ]
})
export class PdfViewModule {}
