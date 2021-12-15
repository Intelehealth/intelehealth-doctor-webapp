import { SessionService } from "src/app/services/session.service";
import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { SignatureComponent } from "./signature/signature.component";
import { EditDetailsComponent } from "./edit-details/edit-details.component";
import { environment } from "../../../environments/environment";
import { TranslationService } from "src/app/services/translation.service";
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.css"],
})
export class MyAccountComponent implements OnInit {
  baseURL = environment.baseURL;
  visitStateProviderType = "0406ffeb-a11a-4bb3-8ea6-3ef43b79dc77";
  setSpiner: boolean = true;

  name = "Enter text";
  visitState = "NA";
  providerDetails = null;
  userDetails: any;
  constructor(
    private sessionService: SessionService,
    private http: HttpClient,
    private dialog: MatDialog,
    private translationService: TranslationService
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
        attributes.forEach((attribute) => {
          this.providerDetails[attribute.attributeType.display] = {
            value: attribute.value,
            uuid: attribute.uuid,
          };
          if (
            attribute.attributeType.uuid ===
            this.sessionService.visitStateProviderType
          ) {
            this.visitState = attribute.value;
          }
        });
        this.setSpiner = false;
      });
      this.translationService.getSelectedLanguage();
  }
  /**
   * Open edit details modal
   */
  onEdit() {
    this.dialog.open(EditDetailsComponent, {
      width: "400px",
      data: this.providerDetails,
    });
  }

  /**
   * Save name to the system
   * @param value String
   */
  saveName(value) {
    const URL = `${this.baseURL}/person/${this.providerDetails.person.uuid}`;
    const json = {
      names: value,
    };
    this.http.post(URL, json).subscribe((response) => {});
  }

  /**
   * Open Signature component
   */
  signature() {
    this.dialog.open(SignatureComponent, {
      width: "500px",
      data: { type: "add" },
    });
  }
}