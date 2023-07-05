import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CoreService } from "src/app/services/core/core.service";
import { SocketService } from "src/app/services/socket.service";

@Component({
  selector: "app-vcall-overlay",
  templateUrl: "./vcall-overlay.component.html",
  styleUrls: ["./vcall-overlay.component.css"],
})
export class VcallOverlayComponent implements OnInit {
  constructor(
    private socketService: SocketService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<VcallOverlayComponent>,
    private cs: CoreService
  ) { }

  ngOnInit(): void { }

  accept() {
    this.socketService.incoming = true;
    this.cs.openVideoCallModal(
      {
        ...this.data,
        initiator: 'hw',
      }
    );
    this.close();
  }

  close() {
    this.dialogRef.close(true);
  }
}
