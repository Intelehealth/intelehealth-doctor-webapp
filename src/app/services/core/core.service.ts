import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { ImagesPreviewComponent } from 'src/app/component/visit-summary/images-preview/images-preview.component';
import { VideoCallComponent } from '../../modal-components/video-call/video-call.component';
import { ChatComponent } from '../../component/chat/chat.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  openImagesPreviewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ImagesPreviewComponent, { panelClass: ["modal-lg", "transparent"], data } );
    return dialogRef.afterClosed();
  }

  openVideoCallModal(data: any): MatDialogRef<VideoCallComponent> {
    const dialogRef = this.dialog.open(VideoCallComponent, { panelClass: "vc-modal-lg", data, hasBackdrop: false, scrollStrategy: new NoopScrollStrategy() });
    return dialogRef;
  }

  openChatBoxModal(data: any): MatDialogRef<ChatComponent> {
    if (!document.getElementById('chatx-modal')) {
      const dialogRef = this.dialog.open(ChatComponent, { data, id: 'chatx-modal', panelClass: "chatbot-container", backdropClass: "chatbot-backdrop", width: "100%", hasBackdrop: true, disableClose:true, scrollStrategy: new NoopScrollStrategy() })
      return dialogRef;
    }
  }
}
