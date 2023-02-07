import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddLicenseKeyComponent } from './add-license-key/add-license-key.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UploadMindmapJsonComponent } from './upload-mindmap-json/upload-mindmap-json.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NoInternetComponent } from './no-internet/no-internet.component';
import { PasswordResetSuccessComponent } from './password-reset-success/password-reset-success.component';
import { HelpMenuComponent } from './help-menu/help-menu.component';
import { SelectLanguageComponent } from './select-language/select-language.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { SharePrescriptionComponent } from './share-prescription/share-prescription.component';
import { SharePrescriptionSuccessComponent } from './share-prescription-success/share-prescription-success.component';
import { SharePrescriptionErrorComponent } from './share-prescription-error/share-prescription-error.component';
import { ViewVisitSummaryComponent } from './view-visit-summary/view-visit-summary.component';
import { ViewVisitPrescriptionComponent } from './view-visit-prescription/view-visit-prescription.component';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { MomentModule } from 'ngx-moment';

@NgModule({
    declarations: [
        AddLicenseKeyComponent,
        UploadMindmapJsonComponent,
        NoInternetComponent,
        PasswordResetSuccessComponent,
        HelpMenuComponent,
        SelectLanguageComponent,
        ConfirmDialogComponent,
        SharePrescriptionComponent,
        SharePrescriptionSuccessComponent,
        SharePrescriptionErrorComponent,
        ViewVisitSummaryComponent,
        ViewVisitPrescriptionComponent,
        ChatBoxComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        NgxDropzoneModule,
        MomentModule
    ]
})
export class ModalComponentsModule { }
