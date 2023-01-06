import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddLicenseKeyComponent } from './add-license-key/add-license-key.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AddLicenseKeyComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    AddLicenseKeyComponent
  ]
})
export class ModalComponentsModule { }
