import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ComfirmationDialogService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(msg,type?){
    return this.dialog.open(ConfirmationDialogComponent,{
       width: '550px',
       panelClass: 'confirm-dialog-container',
       disableClose: true,
       position: { top: "180px" },
       data :{
         message : msg,
         type
       }
     });
   }
}
