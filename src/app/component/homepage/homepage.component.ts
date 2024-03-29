import { AuthService } from "src/app/services/auth.service";
import { SessionService } from "./../../services/session.service";
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { SocketService } from "src/app/services/socket.service";
import { HelperService } from "src/app/services/helper.service";
import { TranslationService } from "src/app/services/translation.service";
import { browserRefresh } from 'src/app/app.component';
declare var getFromStorage: any, saveToStorage: any, deleteFromStorage: any;

export interface VisitData {
  id: string;
  name: string;
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
export class HomepageComponent implements OnInit, OnDestroy {
  value: any = {};
  flagPatientNo = 0;
  activePatient = 0;
  visitNoteNo = 0;
  completeVisitNo = 0;
  setSpiner = true;
  specialization;
  doctorLocation;
  allVisits = [];
  limit = 100;
  allVisitsLoaded = false;
  systemAccess:boolean = false;
  provider: any;

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private service: VisitService,
    private snackbar: MatSnackBar,
    private socket: SocketService,
    private helper: HelperService,
    private cdr: ChangeDetectorRef,
    private translationService: TranslationService
  ) {}

  ngOnInit() {
    if (getFromStorage("visitNoteProvider")) {
      deleteFromStorage("visitNoteProvider");
    }
    const userDetails = getFromStorage("user");
    if (userDetails) {
      this.sessionService.provider(userDetails.uuid).subscribe((provider) => {
        saveToStorage("provider", provider.results[0]);
        this.provider = provider.results[0];
        const attributes = provider.results[0].attributes;
        attributes.forEach((element) => {
          // Doctor Specialization
          if (
            element.attributeType.uuid ===
              "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
            !element.voided
          ) {
            this.specialization = element.value;
          }

          // Doctor Location
          if (
            element.attributeType.uuid ===
              "07f56d25-88b4-4e2d-9c42-987023527752" &&
            !element.voided
          ) {
            this.doctorLocation = element.value;
          }

          // Doctor Registration number
          if (
            element.attributeType.uuid ===
              "992ccbdd-201a-44ef-8abb-c2eee079886d" &&
            !element.voided
          ) {
            saveToStorage("registrationNumber", element.value);
          }

        });
        userDetails["roles"].forEach((role) => {
          if (role.uuid === "f6de773b-277e-4ce2-9ee6-8622b8a293e8" ||
              role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a" ||
              role.uuid === "04902b9c-4acd-4fbf-ab37-6d9a81fd98fe") {
            this.systemAccess = true;
          }
        });
        this.getVisits();
        //this.getVisitCounts(this.specialization);
      });
    } else {
      this.authService.logout();
    }
    this.socket.initSocket(true);
    this.socket.onEvent("updateMessage").subscribe((data) => {
      this.socket.showNotification({
        title: "New chat message",
        body: data.message,
        timestamp: new Date(data.createdAt).getTime(),
      });
      this.playNotify();
    });
    this.translationService.getSelectedLanguage();
    if(browserRefresh) {
      this.translationService.changeCssFile(localStorage.getItem("selectedLanguage"));
    }
  }

  ngOnDestroy() {
    if (this.socket.socket && this.socket.socket.close)
      this.socket.socket.close();
  }

  getVisitCounts(speciality) {
    const getTotal = (data, type) => {
      const item = data.find(({ Status }: any) => Status === type);
      return item?.Total || 0;
    };
    this.service.getVisitCounts(speciality).subscribe(({ data }: any) => {
      if (data.length) {
        this.flagPatientNo = getTotal(data, "Priority");
        this.activePatient = getTotal(data, "Awaiting Consult");
        this.visitNoteNo = getTotal(data, "Visit In Progress");
        this.completeVisitNo = getTotal(data, "Completed Visit");
      }
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  getVisits(query: any = {}, cb = () => {}) {
    this.service.getVisits(query).subscribe(
      (response) => {
        response.results.forEach((item) => {
          this.allVisits = this.helper.getUpdatedValue(this.allVisits, item);
        });
        this.allVisits.forEach((active) => {
          if(this.doctorLocation){
            for(let location = 0; location < this.doctorLocation.split(',').length; location++){
              if (active?.location?.uuid == this.doctorLocation.split(',')[location]) {
                // Check if doctor is visit note encounter provider
                if (active.encounters.length > 0) {
                  let isVnEncProvider = false;
                  let isSameSpecialityDoctorViewingVisit = false;
                  for (let i = 0; i < active.encounters.length; i++) {
                    if (active.encounters[i].encounterType.display == "Visit Note") {
                      for (let j = 0; j < active.encounters[i].encounterProviders.length; j++) {
                        for (let x = 0; x < active.encounters[i].encounterProviders[j].provider.attributes.length; x++) {
                          if (active.encounters[i].encounterProviders[j].provider.attributes[x].value == this.specialization) {
                            isSameSpecialityDoctorViewingVisit = true;
                            break;
                          }
                        }
                        if (active.encounters[i].encounterProviders[j].provider.uuid == this.provider.uuid) {
                          isVnEncProvider = true;
                          break;
                        }
                      }
                      break;
                    }
                  }
  
                  // Check if visit is referred to this doctor or not
                  let isReferred = false;
                  const referralHistory = active.attributes.find(attr => attr.attributeType.uuid == 'eb2ea3f4-006f-470e-8f1f-0966ab00cd2d')?.value;
                  let ref = [];
                  if(referralHistory) {
                    ref = referralHistory.split('-->');
                    let index = ref.indexOf(this.specialization);
                    if (index != 0 && index != -1) {
                      isReferred = true;
                    }
                  }
  
                  if(this.systemAccess) {
                    this.visitCategory(active, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
                  } else if (isVnEncProvider) {
                    this.visitCategory(active, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
                  } else if (active.attributes.length) {
                    const attributes = active.attributes;
                    const speRequired = attributes.filter(
                      (attr) =>
                        attr.attributeType.uuid === "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d" || attr.attributeType.uuid === "8100ec1a-063b-47d5-9781-224d835fc688"
                    );
                    if (speRequired.length) {
                      for (let x = 0; x < speRequired.length; x++) {
                        if (speRequired[x].value === this.specialization) {
                          this.visitCategory(active, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
                          break;
                        }
                      }
                    }
                  } else if (this.specialization === "General Physician") {
                    this.visitCategory(active, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
                  }
                }
                this.value = {};
              }
            }
          }
        });
        if (response.results.length === 0) {
         // this.setVisitlengthAsPerLoadedData();
          this.allVisitsLoaded = true;
        }
        this.helper.refreshTable.next();
        this.setSpiner = false;
        this.isLoadingNextSlot = false;
      },
      (err) => {
        if (err.error instanceof Error) {
          this.translationService.getTranslation("Client-side error");
        } else {
          this.translationService.getTranslation("Server-side error");
        }
      }
    );
  }

  getLength(arr) {
    let data = [];
    arr.forEach((item) => {
      data = this.helper.getUpdatedValue(data, item, "id");
    });
    return data.filter((i) => i).slice().length;
  }

  setVisitlengthAsPerLoadedData() {
    this.flagPatientNo = this.getLength(this.flagVisit);
    this.activePatient = this.getLength(this.waitingVisit);
    this.visitNoteNo = this.getLength(this.progressVisit);
    this.completeVisitNo = this.getLength(this.completedVisit);
  }

  get completedVisit() {
    return this.service.completedVisit;
  }
  get progressVisit() {
    return this.service.progressVisit;
  }

  get flagVisit() {
    return this.service.flagVisit;
  }
  get waitingVisit() {
    return this.service.waitingVisit;
  }

  checkVisit(encounters, visitType) {
    return encounters.find(({ display = "" }) => display.includes(visitType));
  }

  visitCategory(active, isVnEncProvider = false, isReferred = false, isSameSpecialityDoctorViewingVisit = false) {
    const { encounters = [] } = active;
    let encounter;
    if (
      (encounter =
        this.checkVisit(encounters, "Visit Complete") ||
        this.checkVisit(encounters, "Patient Exit Survey"))
    ) {
      const values = this.assignValueToProperty(active, encounter, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
      this.completeVisitNo += 1;
      this.service.completedVisit.push(values);
    } else if ((encounter = this.checkVisit(encounters, "Visit Note"))) {
      const values = this.assignValueToProperty(active, encounter, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
      if (isReferred) {
        if (!isVnEncProvider && !isSameSpecialityDoctorViewingVisit) {
          if ((encounter = this.checkVisit(encounters, "Flagged"))) {
            this.flagPatientNo += 1;
            this.service.flagVisit.push(values);
          } else if ((encounter =
            this.checkVisit(encounters, "ADULTINITIAL") ||
            this.checkVisit(encounters, "Vitals"))) {
            this.activePatient += 1;
            this.service.waitingVisit.push(values);
          }
        } else if (isVnEncProvider) {
          this.visitNoteNo += 1;
          this.service.progressVisit.push(values);
        }
      } else {
        if (isVnEncProvider) {
          this.visitNoteNo += 1;
          this.service.progressVisit.push(values);
        } else {
          if (isSameSpecialityDoctorViewingVisit) {
            this.visitNoteNo += 1;
            this.service.progressVisit.push(values);
          } else {
            if ((encounter = this.checkVisit(encounters, "Flagged"))) {
              this.flagPatientNo += 1;
              this.service.flagVisit.push(values);
            } else if ((encounter =
              this.checkVisit(encounters, "ADULTINITIAL") ||
              this.checkVisit(encounters, "Vitals"))) {
              this.activePatient += 1;
              this.service.waitingVisit.push(values);
            }
          }
        }
      }
    } else if ((encounter = this.checkVisit(encounters, "Flagged"))) {
      if (!this.checkVisit(encounters, "Flagged").voided) {
        const values = this.assignValueToProperty(active, encounter, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
        this.flagPatientNo += 1;
        this.service.flagVisit.push(values);
      }
    } else if (
      (encounter =
        this.checkVisit(encounters, "ADULTINITIAL") ||
        this.checkVisit(encounters, "Vitals"))
    ) {
      const values = this.assignValueToProperty(active, encounter, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit);
      this.activePatient += 1;
      this.service.waitingVisit.push(values);
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
  getPhoneNumber(attributes) {
    let phoneObj = attributes.find(({ display = "" }) =>
      display.includes("Telephone Number")
    );
    return phoneObj ? phoneObj.value : "NA";
  }
  assignValueToProperty(active, encounter, isVnEncProvider, isReferred, isSameSpecialityDoctorViewingVisit) {
    this.value.visitId = active.uuid;
    this.value.patientId = active.patient.uuid;
    this.value.id = active.patient.identifiers[0].identifier;
    this.value.name = active.patient.person.display;
    this.value.telephone = this.getPhoneNumber(active.patient.attributes);
    this.value.gender = active.patient.person.gender;
    this.value.age = active.patient.person.age;
    this.value.location = active.location.display;
    this.value.status = encounter.encounterType.display;
    this.value.provider = '';
    for (let x = 0; x < encounter.encounterProviders.length; x++) {
      this.value.provider += encounter.encounterProviders[x].provider.display.split("- ")[1] + '<br/>';
    }
    // this.value.provider =
    //   encounter.encounterProviders[0].provider.display.split("- ")[1];
    this.value.lastSeen = encounter.encounterDatetime;
    this.value.isVnEncProvider = isVnEncProvider;
    this.value.isReferred = isReferred;
    this.value.isSameSpecialityDoctorViewingVisit = isSameSpecialityDoctorViewingVisit;
    this.value.assignedToAdmin = false;
    const attributes = active.attributes;
    const speRequired = attributes.filter(
      (attr) =>
        attr.attributeType.uuid === "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d" || attr.attributeType.uuid === "8100ec1a-063b-47d5-9781-224d835fc688" || 'eb2ea3f4-006f-470e-8f1f-0966ab00cd2d'
    );
    if (speRequired.length) {
      for (let x = 0; x < speRequired.length; x++) {
        if (speRequired[x].value.match('Admin') != null) {
          this.value.assignedToAdmin = true;
          break;
        }
      }
    }
    return this.value;
  }

  playNotify() {
    const audioUrl = "../../../../intelehealth/assets/notification.mp3";
    new Audio(audioUrl).play();
  }
}
