import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
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
  constructor(private chatSvc: ChatService, private pageTitleService: PageTitleService) { }

  ngOnInit(): void {
    this.pageTitleService.setTitle({ title: 'Messages', imgUrl: 'assets/svgs/chat-icon-blue-circle.svg' });
  }

  onConversationSelected(latestChat) {
    this.latestChat = latestChat;
  }
}
