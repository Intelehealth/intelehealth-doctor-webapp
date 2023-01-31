import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
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
  constructor(
    private visitService: VisitService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  onConversationSelected(latestChat) {
    if (latestChat.patientId) {
      this.latestChat = latestChat;
      this.getVisits(latestChat.patientId);
      return;
    }
    this.getVisits(latestChat?.person?.uuid);
  }

  getVisits(patientId: any) {
    this.visitService.recentVisits(patientId).subscribe((response) => {
      let visits = response.results;
      if (!visits?.length) {
        this.toast({
          message: `No visit found for these patient.`,
        });
        return;
      }
      let hwName,
        toUserId,
        createdAt = "";
      for (let i = 0; i < visits.length; i++) {
        const visit = visits[i]?.encounters;
        for (let j = 0; j < visit.length; j++) {
          const encounter = visit[j];
          if (
            encounter?.display?.includes("Vitals") ||
            encounter?.display?.includes("ADULTINITIAL")
          ) {
            if (encounter?.encounterProviders[0]?.display.indexOf(":") != -1) {
              hwName = encounter?.encounterProviders[0]?.display.split(":");
            }
            toUserId = encounter?.encounterProviders[0]?.uuid;
            createdAt = encounter?.encounterDatetime;
          }
        }
      }
      const chat = {
        visitId: visits[0]?.uuid,
        patientId: visits[0]?.patient?.uuid,
        toUser: toUserId,
        hwName: hwName[0],
        createdAt: createdAt,
        isNewChat: true,
      };
      this.latestChat = chat;
    });
  }

  toast({
    message,
    duration = 5000,
    horizontalPosition = "center",
    verticalPosition = "bottom",
  }) {
    const opts: any = {
      duration,
      horizontalPosition,
      verticalPosition,
    };
    this.snackbar.open(message, null, opts);
  }
}
