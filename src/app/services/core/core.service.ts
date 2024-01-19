import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { VcallOverlayComponent } from 'src/app/component/vc/vcall-overlay/vcall-overlay.component';
import { AddAssessmentComponent } from 'src/app/modal-components/add-assessment/add-assessment.component';
import { AddLicenseKeyComponent } from 'src/app/modal-components/add-license-key/add-license-key.component';
import { AddPlanAssessmentComponent } from 'src/app/modal-components/add-plan-assessment/add-plan-assessment.component';
import { ChatBoxComponent } from 'src/app/modal-components/chat-box/chat-box.component';
import { ConfirmDialogComponent } from 'src/app/modal-components/confirm-dialog/confirm-dialog.component';
import { ConfirmOpenmrsIdComponent } from 'src/app/modal-components/confirm-openmrs-id/confirm-openmrs-id.component';
import { HelpMenuComponent } from 'src/app/modal-components/help-menu/help-menu.component';
import { ImagesPreviewComponent } from 'src/app/modal-components/images-preview/images-preview.component';
import { NoInternetComponent } from 'src/app/modal-components/no-internet/no-internet.component';
import { PasswordResetSuccessComponent } from 'src/app/modal-components/password-reset-success/password-reset-success.component';
import { PrescribeIvFluidComponent } from 'src/app/modal-components/prescribe-iv-fluid/prescribe-iv-fluid.component';
import { PrescribeMedicationComponent } from 'src/app/modal-components/prescribe-medication/prescribe-medication.component';
import { PrescribeOxytocinComponent } from 'src/app/modal-components/prescribe-oxytocin/prescribe-oxytocin.component';
import { PrescribePlanComponent } from 'src/app/modal-components/prescribe-plan/prescribe-plan.component';
import { SearchedPatientsComponent } from 'src/app/modal-components/searched-patients/searched-patients.component';
import { SelectLanguageComponent } from 'src/app/modal-components/select-language/select-language.component';
import { UploadMindmapJsonComponent } from 'src/app/modal-components/upload-mindmap-json/upload-mindmap-json.component';
import { VideoCallComponent } from 'src/app/modal-components/video-call/video-call.component';
import { ViewAsssessmentComponent } from 'src/app/modal-components/view-asssessment/view-asssessment.component';
import { ViewPlanComponent } from 'src/app/modal-components/view-plan/view-plan.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  openConfirmationDialog(data: { confirmationMsg: string, cancelBtnText: string, confirmBtnText: string }): MatDialogRef<ConfirmDialogComponent> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { panelClass: 'modal-md', data });
    return dialogRef;
  }

  openHelpMenuModal(): MatDialogRef<HelpMenuComponent> {
    const dialogRef = this.dialog.open(HelpMenuComponent, { panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "20px", right: "20px" }, hasBackdrop: false });
    return dialogRef;
  }

  openAddLicenseKeyModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AddLicenseKeyComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }

  openUploadMindmapModal(): Observable<any> {
    const dialogRef = this.dialog.open(UploadMindmapJsonComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openNoInternetConnectionModal(): Observable<any> {
    const dialogRef = this.dialog.open(NoInternetComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openPasswordResetSuccessModal(): Observable<any> {
    const dialogRef = this.dialog.open(PasswordResetSuccessComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openSelectLanguageModal(): Observable<any> {
    const dialogRef = this.dialog.open(SelectLanguageComponent, { panelClass: 'modal-md' });
    return dialogRef.afterClosed();
  }

  openChatBoxModal(data: any): MatDialogRef<ChatBoxComponent> {
    const dialogRef = this.dialog.open(ChatBoxComponent, { data, panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "80px", right: "20px" }, hasBackdrop: false });
    return dialogRef;
  }

  openVideoCallModal(data: any): MatDialogRef<VideoCallComponent> {
    const dialogRef = this.dialog.open(VideoCallComponent, { panelClass: "vc-modal-lg", data, hasBackdrop: false });
    return dialogRef;
  }

  openVideoCallOverlayModal(data: any): MatDialogRef<VcallOverlayComponent> {
    const dialogRef = this.dialog.open(VcallOverlayComponent, { panelClass: "modal-sm", data, id: "vcOverlayModal", disableClose: true, hasBackdrop: true });
    return dialogRef;
  }

  openSearchedPatientModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(SearchedPatientsComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openImagesPreviewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ImagesPreviewComponent, { panelClass: ["modal-lg", "transparent"], data });
    return dialogRef.afterClosed();
  }

  openConfirmOpenMrsIdModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ConfirmOpenmrsIdComponent, { panelClass: "modal-md", data, disableClose: true });
    return dialogRef.afterClosed();
  }

  openAddAssessmentAndPlanModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AddPlanAssessmentComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openPrescribePlanModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(PrescribePlanComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openPrescribeMedicationModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(PrescribeMedicationComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openPrescribeOxytocinModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(PrescribeOxytocinComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openPrescribeIVFluidModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(PrescribeIvFluidComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openAddAssessmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AddAssessmentComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openViewDetailPlanModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ViewPlanComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }

  openViewDetailAssessmentModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ViewAsssessmentComponent, { panelClass: "modal-lg", data });
    return dialogRef.afterClosed();
  }
}
