import { SessionService } from "src/app/services/session.service";
import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { SignatureComponent } from "./signature/signature.component";
import { EditDetailsComponent } from "./edit-details/edit-details.component";
import { environment } from "../../../environments/environment";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { GlobalConstants } from "src/app/js/global-constants";
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
  visitState = "NA";
  providerDetails = null;
  userDetails: any;
  speciality: string;
  location: string;
  specialization;
  activePatient = 0;
  visitStateAttributeType = "0e798578-96c1-450b-9927-52e45485b151";
  specializationProviderType = "ed1715f5-93e2-404e-b3c9-2a2d9600f062";
  value: any = {};

  constructor(
    private sessionService: SessionService,
    private http: HttpClient,
    private dialog: MatDialog,
    private service: VisitService,
    private snackbar: MatSnackBar
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
          if (
            attribute.attributeType.uuid === this.specializationProviderType &&
            !attribute.voided
          ) {
            this.specialization = attribute.value;
          }
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
        this.getVisitsData();
        this.setSpiner = false;
      });
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
  getStateFromVisit(provider) {
    const attribute = provider.find(
      ({ attributeType }) => attributeType.uuid === this.visitStateAttributeType
    );
    return attribute && attribute.value ? attribute.value : "missing";
  }


  getVisitsData(){
    this.service.getVisits().subscribe(
      (response) => {
        const visits = response.results;
        let stateVisits = [];
        if (this.visitState && this.visitState !== "All") {
          stateVisits = visits.filter(({ attributes }) => {
            const visitState = this.getStateFromVisit(attributes);
            return this.visitState === visitState;
          });
        } else if (this.visitState === "All") {
          stateVisits = visits;
        }
        stateVisits.forEach((active) => {
          if (active.encounters.length > 0) {
            if (active.attributes.length) {
              const attributes = active.attributes;
              const speRequired = attributes.filter(
                (attr) =>
                  attr.attributeType.uuid ===
                  "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
              );
              if (speRequired.length) {
                speRequired.forEach((spe, index) => {
                  if (spe.value === this.specialization) {
                    if (index === 0) {
                      this.visitCategory(active);
                    }
                    if (index === 1 && spe[0] !== spe[1]) {
                      this.visitCategory(active);
                    }
                  }
                });
              }
            } else if (this.specialization === "General Physician") {
              this.visitCategory(active);
            }
          }
          this.value = {};
        });
        this.setSpiner = false;
      },
      (err) => {
        if (err.error instanceof Error) {
          this.snackbar.open("Client-side error", null, { duration: 4000 });
        } else {
          this.snackbar.open("Server-side error", null, { duration: 4000 });
        }
      }
    );
  }

 /**
   * Check for encounter as per visit type passed
   * @param encounters Array
   * @param visitType String
   * @returns Object | null
   */
  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active) {
    const { encounters = [] } = active;
    if (this.checkVisit(encounters, "Visit Complete")) {
      // const values = this.assignValueToProperty(active);

      // this.completedVisit.push(values);
      // this.completeVisitNo += 1;
    } else if (this.checkVisit(encounters, "Visit Note")) {
     
    } else if (this.checkVisit(encounters, "Flagged")) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
       
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      this.checkVisit(encounters, "Vitals")
    ) {
      this.activePatient += 1;
      GlobalConstants.visits.push(active);
    }
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
