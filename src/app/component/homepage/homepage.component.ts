import { GlobalConstants } from "../../js/global-constants";
import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { environment } from "src/environments/environment";
import { DiagnosisService } from "src/app/services/diagnosis.service";
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
  followUpVisitNo = 0;
  flagVisit: VisitData[] = [];
  waitingVisit: VisitData[] = [];
  progressVisit: VisitData[] = [];
  completedVisit: VisitData[] = [];
  followUpVisit: VisitData[] = [];
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
    private snackbar: MatSnackBar,
    private diagnosisService: DiagnosisService
  ) { }

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
        const userRoles = this.userDetails.roles.filter(a => a.name == "Project Manager")
        console.log('userRoles:---110 ', userRoles);
        //const visits1 = userRoles.length > 0 ? pVisits : pVisits.filter(a => a.attributes.length > 0 ? (a.attributes.find(b => b.value == this.specialization)) : "")
        let visits1 = [];
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
      this.getFollowUpVisits(active);
    } else if (this.checkVisit(encounters, "Visit Note") &&
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
      this.checkVisit(encounters, "Vitals") &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active);
      this.waitingVisit.push(values);
      this.activePatient += 1;
      GlobalConstants.visits.push(active);
    }
  }
  
  getFollowUpVisits(visit) {
    if(visit.stopDatetime === null) {
    this.getFollowUpDateAndExamination(visit);
    if(visit.followUp && this.isTodayFollowUp(visit.followUp, visit.examination)) {
    this.followUpVisit.push(this.assignValueToProperty(visit));
    this.followUpVisitNo += 1;
     }
    }
  }

  getFollowUpDateAndExamination(visit) {
    visit?.encounters?.forEach((encounter) => {
      const display = encounter.display;
      if (display.match("Visit Note") !== null) {
        const observations = encounter.obs;
        observations?.forEach((obs) => {
          if (obs.display.match("Follow up visit") !== null) {
             visit.followUp = obs.value;
          }
        });
      }
      if (display.match("ADULTINITIAL") !== null) {
        const observations = encounter.obs;
        observations?.forEach((obs) => {
          if (obs.display.match("PHYSICAL EXAMINATION") !== null) {
             let exam = obs.value.split('-');
             visit.examination = exam[exam.length-1]?.trim();
          }
        });
      }
      
    });
  }

  isTodayFollowUp(followUp, type) {
    let date = followUp.split(',')[0];
    let followUpDate = new Date(date.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    if(followUpDate.setHours(0,0,0,0) === new Date().setHours(0,0,0,0)) {
      return true;
    }else if(type === 'Mild.' || type === 'Moderate.') {
      var dateAfterTenDays = new Date(followUpDate); 
      dateAfterTenDays.setDate(followUpDate.getDate() + 10); // Set now + 10 days as the new date
      if(dateAfterTenDays.setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)) {
        console.log(type, followUpDate, " ", dateAfterTenDays, " ", " ", this.getDays(dateAfterTenDays), [2,4,6,8,10].indexOf(this.getDays(dateAfterTenDays)) != -1)
          if([2,4,6,8,10].indexOf(this.getDays(dateAfterTenDays)) != -1) {
            return true;
          }
      } else {
        return false;
      }    
    } else if(followUpDate.setHours(0,0,0,0) < new Date().setHours(0,0,0,0) && type === 'Severe.') {
      console.log("Severe",followUpDate)
      return true;
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
    this.value.provider = active.encounters[0]?.encounterProviders[0]?.provider.display.split(
      "- "
    )[1];
    this.value.lastSeen = active.encounters[0]?.encounterDatetime;
     if(this.value.provider === undefined) {
    this.value.status = "Invalid visit";
     }
    return this.value;
  }


  private getDays(dateAfterTenDays: Date) {
    var ONEDAY = 1000 * 60 * 60 * 24;
    // Convert both dates to milliseconds
    var date1_ms = dateAfterTenDays.getTime();
    var date2_ms = new Date().getTime();
    // Calculate the difference in milliseconds
    var difference_ms = Math.abs(date1_ms - date2_ms);

    // Convert back to days and return
     return Math.round(difference_ms / ONEDAY);
  }

}
