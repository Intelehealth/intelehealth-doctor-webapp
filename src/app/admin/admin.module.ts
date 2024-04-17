import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AyuComponent } from './ayu/ayu.component';
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SupportComponent } from './support/support.component';
import { MomentModule } from 'ngx-moment';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MatPaginationIntlService } from '../services/mat-pagination.service';
import { SharedModule } from '../shared.module';
import { AdminActionsComponent } from './admin-actions/admin-actions.component';
import { DoctorSpecialityComponent } from './admin-actions/doctor-speciality/doctor-speciality.component';
import { MobileAppLanguagesComponent } from './admin-actions/mobile-app-languages/mobile-app-languages.component';
import { PatientRegistrationComponent } from './admin-actions/patient-registration/patient-registration.component';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, './assets/i18n/', '.json');
}

const routes: Routes = [
  {
    path: '',
    redirectTo: "actions",
    pathMatch: "full"
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'support',
        component: SupportComponent
      },
      {
        path: 'actions',
        children:[
          {
            path: 'ayu',
            component: AyuComponent
          },
          {
            path: 'doctor-specialties',
            component: DoctorSpecialityComponent
          },
          {
            path: 'mobile-app-languages',
            component: MobileAppLanguagesComponent
          },
          {
            path: 'patient-registration',
            component: PatientRegistrationComponent
          },
          {
            path: '',
            component: AdminActionsComponent
          }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [
    AdminComponent,
    AyuComponent,
    SupportComponent,
    AdminActionsComponent,
    DoctorSpecialityComponent,
    MobileAppLanguagesComponent,
    PatientRegistrationComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatSidenavModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    NgSelectModule,
    FormsModule,
    MatPaginatorModule,
    MatCardModule,
    MatTableModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatGridListModule,
    MatMenuModule,
    MatTooltipModule,
    MatTabsModule,
    MatSortModule,
    MatSelectModule,
    MatIconModule,
    MatFormFieldModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: false,
      rolesIsolate: false,
      configurationIsolate: false
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MomentModule,
    SharedModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useClass: MatPaginationIntlService },
  ]
})
export class AdminModule { }
