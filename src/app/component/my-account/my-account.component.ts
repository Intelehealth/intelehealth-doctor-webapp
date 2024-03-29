import { SessionService } from "src/app/services/session.service";
import { Component, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { MatDialog } from "@angular/material/dialog";
import { SignatureComponent } from "./signature/signature.component";
import { EditDetailsComponent } from "./edit-details/edit-details.component";
import { environment } from "../../../environments/environment";
import { VisitService } from "src/app/services/visit.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import * as moment from "moment";
import { ImagesService } from "src/app/services/images.service";
declare var getFromStorage: any, saveToStorage: any;

@Component({
  selector: "app-my-account",
  templateUrl: "./my-account.component.html",
  styleUrls: ["./my-account.component.css"],
})
export class MyAccountComponent implements OnInit {
  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/personimage`;

  setSpiner: boolean = true;
  tat = 0;
  name = "Enter text";
  visitState = "NA";
  completed = [];
  awaiting = [];
  turnAround: any;
  inProgress = []
  providerDetails = null;
  userDetails: any;
  speciality: string;
  location: string;
  specialization;
  activePatient = 0;
  visitStateAttributeType = "0e798578-96c1-450b-9927-52e45485b151";
  specializationProviderType = "ed1715f5-93e2-404e-b3c9-2a2d9600f062";
  value: any = {};
  visitnoteTime;
  visitcompleteTime;
  providerId: any;
  userId: any;
  url: any = '';
  providerInfo: any;
  personImageURL: any;
  image: string;
  completedCount = [];

  constructor(
    private sessionService: SessionService,
    private http: HttpClient,
    private dialog: MatDialog,
    private service: VisitService,
    private Imgservice: ImagesService,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.setSpiner = true;
    this.userDetails = getFromStorage("user");
    this.providerInfo = getFromStorage("provider");
    this.sessionService
      .provider(this.userDetails.uuid)
      .subscribe((provider) => {
        const attributes = provider.results[0].attributes;
        this.providerDetails = provider.results[0];
        saveToStorage("provider", this.providerDetails);

        attributes.forEach((attribute) => {
          if (
            attribute.attributeType.uuid === this.specializationProviderType &&
            !attribute.voided
          ) {
            this.specialization = attribute.value;
          }
          if (!attribute.voided) {
            this.providerDetails[attribute.attributeType.display] = {
              value: attribute.value,
              uuid: attribute.uuid,
            };
          }
          if (
            attribute.attributeType.uuid ===
            this.sessionService.visitStateProviderType
          ) {
            this.visitState = attribute.value;
          }
        });
        // this.getVisitsData();
        this.getDoctorVisitData();
        this.setSpiner = false;
      });

    // this.personImageURL = `${this.baseURLProvider}/${this.providerInfo.person.uuid}`;
    // var header = {
    //   headers: new HttpHeaders({
    //     "Content-Type": "application/json",
    //     Authorization: "Basic " + btoa("nurse:Nurse123"),
    //   }),
    // };

    this.Imgservice.fetchProfileImage(this.providerInfo.person.uuid).subscribe((response) => {
      this.personImageURL = `${this.baseURL}/personimage/${this.providerInfo.person.uuid}`;
    }, (err) => {
      this.personImageURL = 'assets/dummy profile image.jpg';
    });
  }

  get awaitngCount() {
    return localStorage.getItem('awaitingVisitsCount') || 'loading';
  }

  onSelectFile(event) {
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { // called once readAsDataURL is completed
        this.url = event.target.result;
        let imageBolb = this.url.split(',');
        var header = {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa("nurse:Nurse123"),
          }),
        };
        const URL = this.baseURLProvider
        let json = {
          person: this.providerDetails.person.uuid,
          base64EncodedImage: imageBolb[1]
        }
        this.http.post(URL, json, header).subscribe((response) => { });
      }
    }
    window.location.reload();
  }
  /**
   * Open edit details modal
   */
  onEdit() {
    this.dialog.open(EditDetailsComponent, {
      width: "400px",
      maxHeight: "calc(100vh - 60px)",
      data: this.providerDetails,
    });
    (document.scrollingElement as any).style.top = ''; /** AEAT-823 */
  }
  getStateFromVisit(provider) {
    const attribute = provider.find(
      ({ attributeType }) => attributeType.uuid === this.visitStateAttributeType
    );
    return attribute && attribute.value ? attribute.value : "missing";
  }


  getDoctorVisitData(){
    this.userDetails = getFromStorage("user");
    this.service.getDoctorsVisit().subscribe((res)=>{
      const visits = res['rawData'];
      const doctorFilter = visits.filter((v)=>
      v.Doctor_uuid === this.userDetails.uuid)
      const completedVisits = doctorFilter.filter(m=>m.Sign_Submit_time != null);
      this.completedCount.push(completedVisits);
      const tatFilter = doctorFilter.map(a=>a.Doctor_TAT_Secs);
      const calculateTime = tatFilter.reduce((val, acc) => val + acc)
      const averageTime =  +Math.ceil(calculateTime/completedVisits.length);
      this.turnAround = Math.floor(averageTime / 60);
    })
  }

  // getVisitsData() {
  //   this.providerId = getFromStorage("provider");
  //   this.service.getEndedVisits().subscribe(
  //     (response) => {
  //       const visits = response.results;
  //       const stateVisits = visits.filter((v) => {
  //         let flag = false;
  //         const loc = v.attributes.find(
  //           (a) =>
  //             a.attributeType.uuid === "0e798578-96c1-450b-9927-52e45485b151"
  //         );
  //         if ((this.visitState === 'All') || loc && (loc.value === this.visitState || loc.value === "All")) {
  //           flag = true;
  //         }
  //         return flag;
  //       });
  //       const visitNoEnc = stateVisits.filter((v) => v.encounters.length > 0);
  //       let filteredVisits = visitNoEnc;
  //       if (this.specialization !== "General Physician")
  //         filteredVisits = stateVisits.filter((v) => v.attributes.length > 0);
  //       const specialityVisits = filteredVisits.filter((v) => {
  //         let flag = false;
  //         const spec = v.attributes.find(
  //           (a) => a.attributeType.uuid === "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d"
  //         );
  //         if (spec && spec.value === this.specialization) flag = true;
  //         return flag;
  //       });
  //       this.awaiting = [];
  //       this.completed = [];
  //       this.inProgress = [];
  //       this.turnAround = [];
  //       specialityVisits.forEach((visit) => {
  //         visit.encounters.forEach((encounterType, index) => {
  //           let visitnoteTime
  //           if (encounterType?.display.includes('Visit Note')) {
  //             this.visitnoteTime = encounterType.encounterDatetime
  //           }
  //           if (encounterType?.display.includes('Visit Complete')) {
  //             this.visitcompleteTime = encounterType.encounterDatetime
  //           }
  //           var diffDuration = moment(this.visitcompleteTime).diff(this.visitnoteTime);
  //           var asMinutes = moment(diffDuration).minutes();
  //           this.turnAround.push(asMinutes);
  //         });
  //         this.tat = this.turnAround.reduce((val, acc) => val + acc)
  //         this.tat = +Math.ceil(this.tat / this.turnAround.length);
  //         let cachedVisit;
  //         if (this.checkVisit(visit.encounters, "Visit Complete")) {
  //           visit.encounters.forEach((encounterType, index) => {
  //             if (encounterType?.display.includes('Visit Complete')) {
  //               if (this.providerId.uuid === encounterType.encounterProviders[0].provider.uuid) {
  //                 this.completed.push(visit);
  //               }
  //             }
  //           });
  //         } else if (this.checkVisit(visit.encounters, "Visit Note")) {
  //           visit.encounters.forEach((encounterType, index) => {
  //             if (encounterType?.display.includes('Visit Note')) {
  //               if (this.providerId.uuid === encounterType.encounterProviders[0].provider.uuid) {
  //                 this.inProgress.push(visit);
  //               }
  //             }
  //           })
  //         } else if ((cachedVisit = this.checkVisit(visit.encounters, "Flagged"))) {
  //         } else if (
  //           this.checkVisit(visit.encounters, "ADULTINITIAL") ||
  //           this.checkVisit(visit.encounters, "Vitals")
  //         ) {
  //           this.awaiting.push(visit);
  //         }
  //       });

  //     },
  //     (err) => {
  //       if (err.error instanceof Error) {
  //         this.snackbar.open("Client-side error", null, { duration: 4000 });
  //       } else {
  //         this.snackbar.open("Server-side error", null, { duration: 4000 });
  //       }
  //     }
  //   );
  // }

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
