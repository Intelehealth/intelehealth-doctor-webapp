import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChatService } from "src/app/services/chat.service";
import { VisitService } from "src/app/services/visit.service";

@Component({
  selector: "app-message-container",
  templateUrl: "./message-container.component.html",
  styleUrls: ["./message-container.component.scss"],
})
export class MessageContainerComponent implements OnInit {
  latestChat: any;
  patientInfo = [];
  info = {};
  constructor(private chatSvc: ChatService) {}

  ngOnInit(): void {}

  onConversationSelected(latestChat) {
    this.latestChat = latestChat;
    this.readMessages(this.latestChat?.id);
  }

  readMessages(messageId) {
    this.chatSvc.readMessageById(messageId).subscribe({
      next: (res) => {},
    });
  }
}
