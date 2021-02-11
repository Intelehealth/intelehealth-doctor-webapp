import { SessionService } from "src/app/services/session.service";
import { AuthService } from "src/app/services/auth.service";
import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { SignatureComponent } from "./signature/signature.component";
import { EditDetailsComponent } from "./edit-details/edit-details.component";
import { environment } from "../../../environments/environment";
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.css"],
})
export class MyAccountComponent implements OnInit {
  baseURL = environment.baseURL;
  setSpiner: boolean = true;

  name = "Enter text";
  providerDetails = null;
  userDetails: any;
  constructor(
    private sessionService: SessionService,
    private http: HttpClient,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.setSpiner = true;
    this.userDetails = getFromStorage("user");
    this.sessionService
      .provider(this.userDetails.uuid)
      .subscribe((provider) => {
        this.providerDetails = provider.results[0];
        saveToStorage("provider", this.providerDetails);
        const attributes = provider.results[0].attributes;
        attributes.forEach((element) => {
          this.providerDetails[element.attributeType.display] = {
            value: element.value,
            uuid: element.uuid,
          };
        });
        this.setSpiner = false;
      });
  }

  onEdit() {
    this.dialog.open(EditDetailsComponent, {
      width: "400px",
      data: this.providerDetails,
    });
  }

  saveName(value) {
    const URL = `${this.baseURL}/person/${this.providerDetails.person.uuid}`;
    const json = {
      names: value,
    };
    this.http.post(URL, json).subscribe((response) => {});
  }

  signature() {
    this.dialog.open(SignatureComponent, {
      width: "500px",
      data: { type: "add" },
    });
  }
}
