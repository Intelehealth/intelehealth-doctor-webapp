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
import { ChatBoxComponent } from './chat-box/chat-box.component';
import { MomentModule } from 'ngx-moment';
import { VideoCallComponent } from './video-call/video-call.component';
import { SearchedPatientsComponent } from './searched-patients/searched-patients.component';
import { MatListModule } from '@angular/material/list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ImagesPreviewComponent } from './images-preview/images-preview.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from '../shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { SignaturePadModule } from 'angular2-signaturepad';
import { PwaPromptComponent } from './pwa-prompt/pwa-prompt.component';
import { ConfirmOpenmrsIdComponent } from './confirm-openmrs-id/confirm-openmrs-id.component';
import { AddPlanAssessmentComponent } from './add-plan-assessment/add-plan-assessment.component';
import { MatDividerModule } from '@angular/material/divider';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    declarations: [
        AddLicenseKeyComponent,
        UploadMindmapJsonComponent,
        NoInternetComponent,
        PasswordResetSuccessComponent,
        HelpMenuComponent,
        SelectLanguageComponent,
        ConfirmDialogComponent,
        ChatBoxComponent,
        VideoCallComponent,
        SearchedPatientsComponent,
        ImagesPreviewComponent,
        PwaPromptComponent,
        ConfirmOpenmrsIdComponent,
        AddPlanAssessmentComponent
    ],
    imports: [
        CommonModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        NgxDropzoneModule,
        MomentModule,
        MatListModule,
        MatDatepickerModule,
        PdfViewerModule,
        SharedModule,
        NgSelectModule,
        SignaturePadModule,
        MatDividerModule,
        NgbTypeaheadModule
    ],
    exports: []
})
export class ModalComponentsModule { }
