import { GlobalConstants } from "../../js/global-constants";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "src/environments/environment";
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
  telephone: string;
  gender: string;
  age: string;
  location: string;
  status: string;
  lastSeen: string;
  visitId: string;
  patientId: string;
  provider: string;
}

@Component({
  selector: "app-homepage",
  templateUrl: "./homepage.component.html",
  styleUrls: ["./homepage.component.css"],
})
export class HomepageComponent implements OnInit {
  value: any = {};
  whatsappLink: string;
  activePatient = 0;
  flagPatientNo = 0;
  visitNoteNo = 0;
  completeVisitNo = 0;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  setSpiner = true;
  specialization;
  visitStateAttributeType = "0e798578-96c1-450b-9927-52e45485b151";
  specializationProviderType = "ed1715f5-93e2-404e-b3c9-2a2d9600f062";
  visitState = null;
  whatsappIco = environment.production
  ? "https://helpline.ekalarogya.org/intelehealth/assets/images/whatsapp.png"
  : "../../../assets/images/whatsapp.png";

  userDetails: any;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit() {

    if (getFromStorage("visitNoteProvider")) {
      deleteFromStorage("visitNoteProvider");
    }
     this.userDetails = getFromStorage("user");
    if (this.userDetails) {
      this.sessionService.provider(this.userDetails.uuid).subscribe((provider) => {
        saveToStorage("provider", provider.results[0]);
        
        const attributes = provider.results[0].attributes;
        attributes.forEach((attribute) => {
          if (
            attribute.attributeType.uuid === this.specializationProviderType &&
            !attribute.voided
          ) {
            this.specialization = attribute.value;
          }
          if (
            attribute.attributeType.uuid ===
            this.sessionService.visitStateProviderType
            ) {
              this.visitState = attribute.value;
            }
          });
          this.getVisits();
        });
      } else {
        this.authService.logout();
      }
      
      const text = encodeURI(
        `Hello, my name is ${this.userDetails.person.display} and I need some assistance.`
        );
        this.whatsappLink = `https://wa.me/917005308163?text=${text}`;
      }
      
      getStateFromVisit(provider) {
        const attribute = provider.find(
          ({ attributeType }) => attributeType.uuid === this.visitStateAttributeType
          );
          return attribute && attribute.value ? attribute.value : "missing";
        }
        
        /**
         * Get all visits
         */
        getVisits() {
    this.service.getVisits().subscribe(
      (response) => {
        const pVisits = response.results;
        const userRoles = this.userDetails.roles.filter(a=>a.name == "Project Manager")
        console.log('userRoles:---110 ', userRoles);
        //const visits1 = userRoles.length > 0 ? pVisits : pVisits.filter(a => a.attributes.length > 0 ? (a.attributes.find(b => b.value == this.specialization)) : "")
        let visits1 =[];
        if (this.specialization && this.specialization.toLowerCase() == "all") {
          visits1 = pVisits;
        } else {
          visits1 = pVisits.filter((a) => {
            if(a.attributes.length > 0) {
              let splAttributes = a.attributes.filter((a) =>  a.display.includes("Visit Speciality"));              
              if(splAttributes.length > 1) {
                return splAttributes.sort((a,b) => a.dateChanged > b.dateChanged)[0].value == this.specialization;
              } else {
                return splAttributes[0].value == this.specialization;
              }
            }
          });
        }
        const setObj = new Set();
        var visits = visits1.reduce((acc, item) => {
          if (!setObj.has(item.patient.identifiers[0].identifier)) {
            setObj.add(item.patient.identifiers[0].identifier)
            acc.push(item)
          }
          return acc;
        }, []);
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
          this.visitCategory(active);
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

  /**
   * Check for a visit and put it to the respective table as per their encounter
   * @param visitObject Object
   */
  visitCategory(active) {
    const { encounters = [] } = active;
    if (this.checkVisit(encounters, "Patient Exit Survey") ||
        this.checkVisit(encounters, "Visit Complete") ||
         active.stopDatetime != null) {
      const values = this.assignValueToProperty(active);
      this.completedVisit.push(values);
      this.completeVisitNo += 1;
    } else if (this.checkVisit(encounters, "Visit Note")&&
    active.stopDatetime == null) {
      const values = this.assignValueToProperty(active);
      this.progressVisit.push(values);
      this.visitNoteNo += 1;
    } else if (this.checkVisit(encounters, "Flagged")) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active);
        this.flagVisit.push(values);
        this.flagPatientNo += 1;
        GlobalConstants.visits.push(active);
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      this.checkVisit(encounters, "Vitals")&&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active);
      this.waitingVisit.push(values);
      this.activePatient += 1;
      GlobalConstants.visits.push(active);
    }
  }

  /**
   * Transform visit Object to make it compatible to show in the mat table
   * @param visitObject Object
   * @returns Object
   */
  assignValueToProperty(active) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.gender = active.patient.person.gender;
    this.value.telephone = active.patient.attributes[0].attributeType.display == "Telephone Number" ? active.patient.attributes[0].value : "Not Provided" ;
    this.value.age = active.patient.person.age;
    this.value.location = active.patient.person.preferredAddress.stateProvince;
    this.value.status =
    active.stopDatetime != null
      ? "Visit Complete"
      : active.encounters[0]?.encounterType.display;
    this.value.provider = active.encounters[0].encounterProviders[0].provider.display.split(
      "- "
    )[1];
    this.value.lastSeen = active.encounters[0].encounterDatetime;
    return this.value;
  }
}
