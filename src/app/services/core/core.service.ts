import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { ImagesPreviewComponent } from 'src/app/component/visit-summary/images-preview/images-preview.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  openImagesPreviewModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(ImagesPreviewComponent, { panelClass: ["modal-lg", "transparent"], data } );
    return dialogRef.afterClosed();
  }
}
