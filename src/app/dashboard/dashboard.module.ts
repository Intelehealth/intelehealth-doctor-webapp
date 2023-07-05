import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { GetStartedComponent } from './get-started/get-started.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { Ng2TelInputModule } from 'ng2-tel-input';
import { MatTabsModule } from '@angular/material/tabs';
import { SignaturePadModule } from 'angular2-signaturepad';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { NgxPermissionsModule } from 'ngx-permissions';
import { SharedModule } from '../shared.module';
import { PartogramComponent } from './partogram/partogram.component';
import { NgxPanZoomModule } from 'ngx-panzoom';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    DashboardComponent,
    ProfileComponent,
    GetStartedComponent,
    ChangePasswordComponent,
    PartogramComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    MatExpansionModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatStepperModule,
    MatTabsModule,
    SignaturePadModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    Ng2TelInputModule,
    NgxDropzoneModule,
    NgbTypeaheadModule,
    MatDatepickerModule,
    NgxPermissionsModule.forChild({
      permissionsIsolate: false,
      rolesIsolate: false,
      configurationIsolate: false
    }),
    SharedModule,
    NgxPanZoomModule,
    MatProgressSpinnerModule
  ]
})
export class DashboardModule { }
