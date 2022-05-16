import { Component, OnInit } from "@angular/core";
import { SocketService } from "src/app/services/socket.service";

@Component({
  selector: "app-vcall-overlay",
  templateUrl: "./vcall-overlay.component.html",
  styleUrls: ["./vcall-overlay.component.css"],
})
export class VcallOverlayComponent implements OnInit {
  constructor(private socketService: SocketService) {}

  ngOnInit(): void {}

  accept() {
    this.socketService.openVcModal();
    this.close();
  }

  close() {
    this.socketService.closeVcOverlay();
  }
}
