import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MainContainerComponent } from './main-container/main-container.component';
import { RouteAuthGuard } from './core/guards/route-auth.guard';
import { NgxPermissionsGuard } from 'ngx-permissions';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'session',
    loadChildren: () => import('./session/session.module').then(m => m.SessionModule)
  },
  {
    path: '',
    component: MainContainerComponent,
    canActivate: [RouteAuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule),
        data: {
          breadcrumb: 'Dashboard'
        },
        // canActivate: [NgxPermissionsGuard],
        // data: {
        //   permissions: {
        //     except: ['ORGANIZATIONAL: SYSTEM ADMINISTRATOR'],
        //     redirectTo: '/admin'
        //   }
        // }
      },
      {
        path: 'admin',
        loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
        canActivate: [NgxPermissionsGuard],
        data: {
          breadcrumb: 'Admin',
          permissions: {
            only: ['ORGANIZATIONAL: SYSTEM ADMINISTRATOR'],
            redirectTo: '/dashboard'
          }
        }
      }
    ]
  },
  { path: 'epartogram', loadChildren: () => import('./epartogram/epartogram.module').then(m => m.EpartogramModule) },
  {
    path: '**',
    redirectTo: 'session/page-not-found'
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top',
      relativeLinkResolution: 'legacy'
    })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
