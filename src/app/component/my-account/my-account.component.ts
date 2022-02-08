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
  completed = [];
  awaiting = [];
  providerDetails = null;
  userDetails: any;
  speciality: string;
  location: string;
  specialization;
  activePatient = 0;
  visitStateAttributeType = "0e798578-96c1-450b-9927-52e45485b151";
  specializationProviderType = "ed1715f5-93e2-404e-b3c9-2a2d9600f062";
  value: any = {};
  providerId: any;

  constructor(
    private sessionService: SessionService,
    private http: HttpClient,
    private dialog: MatDialog,
    private service: VisitService,
    private snackbar: MatSnackBar
  ) { }

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


  getVisitsData() {
    this.providerId = getFromStorage("provider");
    this.service.getVisits().subscribe(
      (response) => {
        const visits = response.results;

        const stateVisits = visits.filter((v) => {
          let flag = false;
          const loc = v.attributes.find(
            (a) =>
              a.attributeType.uuid === "0e798578-96c1-450b-9927-52e45485b151"
          );
          if ((this.visitState === 'All') || loc && (loc.value === this.visitState || loc.value === "All")) {
            flag = true;
          }
          return flag;
        });
        const visitNoEnc = stateVisits.filter((v) => v.encounters.length > 0);
        let filteredVisits = visitNoEnc;
        if (this.specialization !== "General Physician")
          filteredVisits = stateVisits.filter((v) => v.attributes.length > 0);
        const specialityVisits = filteredVisits.filter((v) => {
          let flag = false;
          const spec = v.attributes.find(
            (a) => a.attributeType.uuid === "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
          );
          if (spec && spec.value === this.specialization) flag = true;
          return flag;
        });
        this.awaiting = [];
        this.completed = [];
        specialityVisits.forEach((visit) => {
          let cachedVisit;
          if (this.checkVisit(visit.encounters, "Visit Complete")) {
            visit.encounters.forEach((encounterType, index) => {
              if (encounterType?.display.includes('Visit Complete')) {
                
                // encounter - visit completed - encounter provider 
                if (this.providerId.uuid === encounterType.encounterProviders[0].provider.uuid) {
                  this.completed.push(visit);
                }
              }
            });
          } else if (this.checkVisit(visit.encounters, "Visit Note")) {
          } else if ((cachedVisit = this.checkVisit(visit.encounters, "Flagged"))) {
            // if (!cachedVisit.voided) priority.push(visit);
          } else if (
            this.checkVisit(visit.encounters, "ADULTINITIAL") ||
            this.checkVisit(visit.encounters, "Vitals")
          ) {
            const attemptOne = [];
           
            this.awaiting.push(visit);
            // encounter - visit note - encounter provider 
          }
        });

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

  /**
   * Save name to the system
   * @param value String
   */
  saveName(value) {
    const URL = `${this.baseURL}/person/${this.providerDetails.person.uuid}`;
    const json = {
      names: value,
    };
    this.http.post(URL, json).subscribe((response) => { });
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
