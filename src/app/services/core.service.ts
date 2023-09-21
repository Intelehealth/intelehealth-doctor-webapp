import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VideoCallComponent } from '../modal-components/video-call/video-call.component';
import { ChatComponent } from '../component/chat/chat.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  // openConfirmationDialog(data: { confirmationMsg: string, cancelBtnText: string, confirmBtnText: string }): MatDialogRef<ConfirmDialogComponent> {
  //   const dialogRef = this.dialog.open(ConfirmDialogComponent, { panelClass: 'modal-md', data });
  //   return dialogRef;
  // }

  // openHelpMenuModal(): MatDialogRef<HelpMenuComponent> {
  //   const dialogRef = this.dialog.open(HelpMenuComponent, { panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "20px", right: "20px" }, hasBackdrop: false });
  //   return dialogRef;
  // }

  // openAddLicenseKeyModal(data: any): Observable<any> {
  //   const dialogRef = this.dialog.open(AddLicenseKeyComponent, { panelClass: 'modal-md', data });
  //   return dialogRef.afterClosed();
  // }

  // openUploadMindmapModal(): Observable<any> {
  //   const dialogRef = this.dialog.open(UploadMindmapJsonComponent, { panelClass: 'modal-md' });
  //   return dialogRef.afterClosed();
  // }

  // openNoInternetConnectionModal(): Observable<any> {
  //   const dialogRef = this.dialog.open(NoInternetComponent, { panelClass: 'modal-md' });
  //   return dialogRef.afterClosed();
  // }

  // openPasswordResetSuccessModal(): Observable<any> {
  //   const dialogRef = this.dialog.open(PasswordResetSuccessComponent, { panelClass: 'modal-md' });
  //   return dialogRef.afterClosed();
  // }

  // openSelectLanguageModal(): Observable<any> {
  //   const dialogRef = this.dialog.open(SelectLanguageComponent, { panelClass: 'modal-md' });
  //   return dialogRef.afterClosed();
  // }

  openChatBoxModal(data: any): MatDialogRef<ChatComponent> {
    if (!document.getElementById('chatx-modal')) {
      const dialogRef = this.dialog.open(ChatComponent, { data, id: 'chatx-modal', panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "80px", right: "20px" }, hasBackdrop: false })
      return dialogRef;
    }
  }

  openVideoCallModal(data: any): MatDialogRef<VideoCallComponent> {
    const dialogRef = this.dialog.open(VideoCallComponent, { panelClass: "vc-modal-lg", data, hasBackdrop: false });
    return dialogRef;
  }

  // openVideoCallOverlayModal(data: any): MatDialogRef<VcallOverlayComponent> {
  //   const dialogRef = this.dialog.open(VcallOverlayComponent, { panelClass: "modal-sm", data, id: "vcOverlayModal", disableClose: true, hasBackdrop: true });
  //   return dialogRef;
  // }

  // openSearchedPatientModal(data: any): Observable<any> {
  //   const dialogRef = this.dialog.open(SearchedPatientsComponent, { panelClass: "modal-lg", data });
  //   return dialogRef.afterClosed();
  // }

  // openImagesPreviewModal(data: any): Observable<any> {
  //   const dialogRef = this.dialog.open(ImagesPreviewComponent, { panelClass: ["modal-lg", "transparent"], data });
  //   return dialogRef.afterClosed();
  // }

  // openConfirmOpenMrsIdModal(data: any): Observable<any> {
  //   const dialogRef = this.dialog.open(ConfirmOpenmrsIdComponent, { panelClass: "modal-md", data, disableClose: true });
  //   return dialogRef.afterClosed();
  // }

  // openAddAssessmentAndPlanModal(data: any): Observable<any> {
  //   const dialogRef = this.dialog.open(AddPlanAssessmentComponent, { panelClass: "modal-lg", data });
  //   return dialogRef.afterClosed();
  // }
}
