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
  searchText: string;
  conversations: any;
  baseURL = environment.baseURL;
  values: any = [];

  get filteredConversations() {
    return this.conversations.filter((conversation) => {
      return (
        conversation.name
          .toLowerCase()
          .includes(this.searchText.toLowerCase()) ||
        conversation.latestMessage
          .toLowerCase()
          .includes(this.searchText.toLowerCase())
      );
    });
  }
  constructor(
    private chatSvc: ChatService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.getPatientsList();
  }

  getPatientsList() {
    this.chatSvc.getPatientList().subscribe({
      next: (res: any) => {
        console.log("res.data: ", res);
        this.conversations = res.data;
      },
    });
  }

  search() {
    if (this.searchText === null || this.searchText.length < 3) {
      this.dialog.open(FindPatientComponent, {
        width: "50%",
        data: { value: "Please enter min 3 characters" },
      });
    } else {
      const url = `${this.baseURL}/patient?q=${this.searchText}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url).subscribe(
        (response) => {
          this.values = [];
          response["results"].forEach((value) => {
            if (value) {
              if (value.identifiers.length) {
                this.values.push(value);
              }
            }
          });
          this.dialog.open(FindPatientComponent, {
            width: "90%",
            data: { value: this.values },
          });
        },
        (err) => {
          if (err.error instanceof Error) {
            this.snackbar.open("Client-side error", null, { duration: 2000 });
          } else {
            this.snackbar.open("Server-side error", null, { duration: 2000 });
          }
        }
      );
    }
  }

  get patientPic() {
    if (!this.conversations.patientPic) {
      return "assets/icons/message/Frame1.png";
    }
    return this.conversations.patientPic;
  }
}
