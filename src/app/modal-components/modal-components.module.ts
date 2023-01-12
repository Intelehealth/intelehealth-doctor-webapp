import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddLicenseKeyComponent } from './add-license-key/add-license-key.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadMindmapJsonComponent } from './upload-mindmap-json/upload-mindmap-json.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxDropzoneModule } from 'ngx-dropzone';

@NgModule({
    declarations: [
        AddLicenseKeyComponent,
        UploadMindmapJsonComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        NgxDropzoneModule
    ]
})
export class ModalComponentsModule { }
