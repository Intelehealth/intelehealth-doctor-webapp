import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { Component, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HelperService } from "src/app/services/helper.service";
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
  allVisitCount = 0;
  setSpiner = true;
  specialization;
  visitStateAttributeType = "0e798578-96c1-450b-9927-52e45485b151";
  specializationProviderType = "ed1715f5-93e2-404e-b3c9-2a2d9600f062";
  visitState = null;
  whatsappIco = "assets/images/whatsapp.png";
  limit = 100;
  allVisitsLoaded = false;
  allVisits = [];
  userDetails: any;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    public service: VisitService,
    private snackbar: MatSnackBar,
    private helper: HelperService
  ) {}

  ngOnInit() {
    if (getFromStorage("visitNoteProvider")) {
      deleteFromStorage("visitNoteProvider");
    }
    this.userDetails = getFromStorage("user");
    if (this.userDetails) {
      this.sessionService
        .provider(this.userDetails.uuid)
        .subscribe((provider) => {
          saveToStorage("provider", provider.results[0]);

          const attributes = provider.results[0].attributes;
          attributes.forEach((attribute) => {
            if (
              attribute.attributeType.uuid ===
                this.specializationProviderType &&
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
          this.getVisits({
            limit: this.limit,
            startIndex: 0,
          });
          this.getVisitCounts(this.specialization);
        });
    } else {
      this.authService.logout();
    }

    const text = encodeURI(
      `Hello, my name is ${this.userDetails.person.display} and I need some assistance.`
    );
    this.whatsappLink = `https://wa.me/917005308163?text=${text}`;
  }

  getVisitCounts(speciality) {
    const getTotal = (data, type) => {
      const item = data.find((d: any) => d[type] > 0);
      return item?.Total || 0;
    };
    this.service.getVisitCounts(speciality).subscribe((res: any) => {
      this.allVisitCount = getTotal(res.data, "Total");
    });
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
  getVisits(query: any = {}, cb = () => {}) {
    this.service.getVisits(query).subscribe(
      (response) => {
        response.results.forEach((item) => {
          this.allVisits = this.helper.getUpdatedValue(this.allVisits, item);
        });
        const userRoles = this.userDetails.roles.filter(
          (a) => a.name == "Project Manager"
        );
        const visits1 =
          userRoles.length > 0
            ? this.allVisits
            : this.allVisits.filter((a) =>
                a.attributes.length > 0
                  ? a.attributes.find((b) => b.value == this.specialization)
                  : ""
              );

        const setObj = new Set();
        var visits = visits1.reduce((acc, item) => {
          if (!setObj.has(item.patient.identifiers[0].identifier)) {
            setObj.add(item.patient.identifiers[0].identifier);
            acc.push(item);
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
          if (this.specialization === undefined) {
            this.visitCategory(active);
          }
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
            }
          }
          this.value = {};
        });
        if (response.results.length === 0) {
          this.setVisitlengthAsPerLoadedData(stateVisits);
          this.allVisitsLoaded = true;
        }
        this.helper.refreshTable.next();
        this.setSpiner = false;
        this.isLoadingNextSlot = false;
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

  tableValues = [];
  getLength(arr) {
    let data = [];
    arr.forEach((item) => {
      data = this.helper.getUpdatedValue(data, item, "id");
    });
    return data.filter((i) => i).slice().length;
  }

  setVisitlengthAsPerLoadedData(allVisits = []) {
    this.allVisitCount = this.getLength(this.service.allVisits);
    this.helper.refreshTable.next();
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
    if (
      this.checkVisit(encounters, "Patient Exit Survey") ||
      this.checkVisit(encounters, "Visit Complete") ||
      active.stopDatetime != null
    ) {
      const values = this.assignValueToProperty(active);
      this.service.allVisits.push(values);
    } else if (
      this.checkVisit(encounters, "Visit Note") &&
      active.stopDatetime == null
    ) {
      const values = this.assignValueToProperty(active);
      this.service.allVisits.push(values);
    } else if (this.checkVisit(encounters, "Flagged")) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active);
        this.service.allVisits.push(values);
      }
    } else if (
      this.checkVisit(encounters, "ADULTINITIAL") ||
      (this.checkVisit(encounters, "Vitals") && active.stopDatetime == null)
    ) {
      const values = this.assignValueToProperty(active);
      this.service.allVisits.push(values);
    }
  }

  get nextPage() {
    return Number((this.allVisits.length / this.limit).toFixed()) + 2;
  }

  tableChange({ loadMore, refresh }) {
    if (loadMore) {
      if (!this.isLoadingNextSlot) this.setSpiner = true;
      const query = {
        limit: this.limit,
        startIndex: this.allVisits.length,
      };
      this.getVisits(query, refresh);
    }
  }

  isLoadingNextSlot = false;
  loadNextSlot() {
    if (!this.isLoadingNextSlot && !this.allVisitsLoaded) {
      this.isLoadingNextSlot = true;
      this.tableChange({ loadMore: true, refresh: () => {} });
    }
  }

  /**
   * Transform visit Object to make it compatible to show in the mat table
   * @param visitObject Object
   * @returns Object
   */
  assignValueToProperty(active) {
    try {
      this.value.visitId = active.uuid;
      this.value.patientId = active.patient.uuid;
      this.value.id = active.patient.identifiers[0].identifier;
      this.value.name = active.patient.person.display;
      this.value.gender = active.patient.person.gender;
      this.value.telephone =
        active.patient.attributes[0].attributeType.display == "Telephone Number"
          ? active.patient.attributes[0].value
          : "Not Provided";
      this.value.age = active.patient.person.age;
      this.value.location = active.location.display;
      this.value.status =
        active.stopDatetime != null
          ? "Visit Complete"
          : active.encounters[0]?.encounterType.display;
      this.value.dateOfRegistration = active.patient.dateCreated;
      this.value.lastSeen = active.encounters[0].encounterDatetime;
      this.value.provider =
        active.encounters[0].encounterProviders[0].provider.display.split(
          "- "
        )[1];
      return this.value;
    } catch (error) {
      return this.value;
    }
  }
}
