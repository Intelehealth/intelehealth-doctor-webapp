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
    if (this.searchValue === null || this.searchValue.length < 3) {
      this.toast({
        message: `Please enter min 3 characters.`,
      });
      return;
    } else {
      const url = `${this.baseURL}/patient?q=${this.searchValue}&v=custom:(uuid,identifiers:(identifierType:(name),identifier),person)`;
      this.http.get(url).subscribe(
        (response) => {
          this.searchResults = [];
          response["results"].forEach((value) => {
            if (value) {
              if (value.identifiers.length) {
                this.searchResults.push(value);
              }
            }
          });
          // this.dialog.open(FindPatientComponent, {
          //   width: "90%",
          //   data: { value: this.searchResults },
          // });
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

  get patientPic() {
    if (!this.conversations.patientPic) {
      return "assets/icons/message/Frame1.png";
    }
    return this.conversations.patientPic;
  }
}
