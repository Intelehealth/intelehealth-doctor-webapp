import { HttpClient } from "@angular/common/http";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ChatService } from "src/app/services/chat.service";
import { environment } from "src/environments/environment";
import { FindPatientComponent } from "../../find-patient/find-patient.component";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  @Output() conversationClicked: EventEmitter<any> = new EventEmitter();
  conversations: any;
  searchValue: string;
  baseURL = environment.baseURL;
  searchResults: any = [];

  get filteredConversations() {
    return this.conversations.filter((conversation) => {
      return (
        conversation?.patientName
          .toLowerCase()
          .includes(this.searchValue.toLowerCase()) ||
        conversation?.message
          .toLowerCase()
          .includes(this.searchValue.toLowerCase())
      );
    });
  }
  constructor(
    private chatSvc: ChatService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.getPatientsList(this.chatSvc?.user?.uuid);
  }

  getPatientsList(drUuid) {
    this.chatSvc.getPatientList(drUuid).subscribe({
      next: (res: any) => {
        this.conversations = res.data;
      },
    });
  }

  get patientPic() {
    if (!this.conversations.patientPic) {
      return "assets/icons/message/Frame1.png";
    }
    return this.conversations.patientPic;
  }
}
