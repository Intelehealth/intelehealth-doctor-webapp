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
import { VideoCallComponent } from './video-call/video-call.component';
import { SearchedPatientsComponent } from './searched-patients/searched-patients.component';
import { MatListModule } from '@angular/material/list';
import { AppointmentDetailComponent } from './appointment-detail/appointment-detail.component';
import { RescheduleAppointmentComponent } from './reschedule-appointment/reschedule-appointment.component';
import { RescheduleAppointmentConfirmComponent } from './reschedule-appointment-confirm/reschedule-appointment-confirm.component';
import { CancelAppointmentConfirmComponent } from './cancel-appointment-confirm/cancel-appointment-confirm.component';
import { AppointmentDetailMonthComponent } from './appointment-detail-month/appointment-detail-month.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ImagesPreviewComponent } from './images-preview/images-preview.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

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
        ChatBoxComponent,
        VideoCallComponent,
        SearchedPatientsComponent,
        AppointmentDetailComponent,
        RescheduleAppointmentComponent,
        RescheduleAppointmentConfirmComponent,
        CancelAppointmentConfirmComponent,
        AppointmentDetailMonthComponent,
        ImagesPreviewComponent
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
        PdfViewerModule
    ]
})
export class ModalComponentsModule { }
