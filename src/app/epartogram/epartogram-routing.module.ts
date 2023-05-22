import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EpartogramComponent } from './epartogram.component';

const routes: Routes = [{ path: ':id', component: EpartogramComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpartogramRoutingModule { }
