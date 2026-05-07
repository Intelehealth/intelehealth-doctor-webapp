import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Stage3Component } from './stage3.component';

const routes: Routes = [{ path: ':id', component: Stage3Component }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class Stage3RoutingModule { }
