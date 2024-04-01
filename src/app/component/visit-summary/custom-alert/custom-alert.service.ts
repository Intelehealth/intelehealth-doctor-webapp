import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CustomAlertComponent } from './custom-alert.component';

@Injectable({
  providedIn: 'root'
})
export class CustomAlertService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog(msg,type?){
    return this.dialog.open(CustomAlertComponent,{
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
