import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VideoCallComponent } from '../modal-components/video-call/video-call.component';
import { ChatComponent } from '../component/chat/chat.component';
import { NoopScrollStrategy } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  openVideoCallModal(data: any): MatDialogRef<VideoCallComponent> {
    const dialogRef = this.dialog.open(VideoCallComponent, { panelClass: "vc-modal-lg", data, hasBackdrop: false, scrollStrategy: new NoopScrollStrategy() });
    return dialogRef;
  }

}
