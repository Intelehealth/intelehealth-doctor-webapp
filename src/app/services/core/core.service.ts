import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs/internal/Observable';
import { AddLicenseKeyComponent } from 'src/app/modal-components/add-license-key/add-license-key.component';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private dialog: MatDialog) { }

  openAddLicenseKeyModal(data: any): Observable<any> {
    const dialogRef = this.dialog.open(AddLicenseKeyComponent, { panelClass: 'modal-md', data });
    return dialogRef.afterClosed();
  }
}
