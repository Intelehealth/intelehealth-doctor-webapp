import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmDialogService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(msg: string, isSms?){
    return this.dialog.open(ConfirmDialogComponent,{
       width: isSms === "info" ? '360px':'550px',
       panelClass: 'confirm-dialog-container',
       disableClose: true,
       position: { top: "180px" },
       data :{
         message : msg,
         type: isSms
       }
     });
   }
}