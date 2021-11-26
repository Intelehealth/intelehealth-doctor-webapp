import { VisitService } from "../../services/visit.service";
import { Component, OnInit, Input } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ConfirmDialogService } from "./confirm-dialog/confirm-dialog.service";

declare var getFromStorage: any,
  saveToStorage: any,
  getEncounterProviderUUID: any;

@Component({
  selector: "app-visit-summary",
  templateUrl: "./visit-summary.component.html",
  styleUrls: ["./visit-summary.component.css"],
})
export class VisitSummaryComponent implements OnInit {
  @Input() visitUUID;
  @Input() visitDate;
  baseURL = environment.baseURL;

  show = false;
  text: string;
  font: string;
  visitNotePresent = false;
  caseNote = false;
  visitCompletePresent = false;
  setSpiner = true;
  doctorDetails;
  doctorValue;
  diagnosis: any = [];
  patientId: string;
  visitUuid: string;
  visitAttributes: any;
  visitSpeciality: any;
  userSpeciality: any;
  userRole: any;
  DoctorNotNeeded: any;
  isVisitEnded:boolean = false;
  isFollowUpComplaint:boolean = false;
  conceptIds = [
    "537bb20d-d09d-4f88-930b-cc45c7d662df",
    "162169AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "67a050c1-35e5-451c-a4ab-fff9d57b0db1",
    "c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca",
    "23601d71-50e6-483f-968d-aeef3031346d",
    "67a050c1-35e5-451c-a4ab-fff9d57b0db1",
    "e8caffd6-5d22-41c4-8d6a-bc31a44d0c86",
    "62bff84b-795a-45ad-aae1-80e7f5163a82",
    "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba",
    "e1761e85-9b50-48ae-8c4d-e6b7eeeba084",
    "3edb0e09-9135-481e-b8f0-07a26fa9a5ce",
    "d63ae965-47fb-40e8-8f08-1f46a8a60b2b",
    "0d3336f1-df6c-48ab-a7a3-c93b1054b7b7"
  ];

  constructor(
    private service: EncounterService,
    private visitService: VisitService,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private diagnosisService: DiagnosisService,
    private confirmDialogService: ConfirmDialogService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    setTimeout(() => {
      this.setSpiner = false;
    }, 1000);
    const userDetails = getFromStorage("user");
    const hideRole = userDetails.roles.filter(
      (a) => a.name == "Project Manager"
    );
    this.userRole =
      hideRole.length > 0 ? hideRole[0].name == "Project Manager" : "";

    // this.visitUuid = this.visitUUID;
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService.getObsAll(this.patientId).subscribe((response) => {
      const ObsData = response.results.filter((a) =>
      this.conceptIds.includes(a.concept.uuid)
      );
      if (ObsData.length > 0) {
        this.diagnosisService.isVisitSummaryChanged = true;
      } else {
        this.diagnosisService.isVisitSummaryChanged = false;
      }
    });
    // const visitUuid = this.visitUUID;
    this.visitService.fetchVisitDetails(this.visitUUID).subscribe((visitDetails) => {
      this.visitAttributes= visitDetails;
      this.visitSpeciality = this.visitAttributes.attributes.find(a=>a.attributeType.uuid == "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d").value;
      const providerDetails = getFromStorage("provider");
      this.userSpeciality = providerDetails.attributes.find(a=>a.attributeType.display == "specialization").value;
      
      //Doctor not need speciality
      this.DoctorNotNeeded = providerDetails.attributes.find(a=>a.attributeType.display == "specialization").value == "Doctor not needed";
      if (visitDetails.stopDatetime !== null) {
        this.isVisitEnded = true;
      }
      visitDetails.encounters.forEach((visit) => {
        
        if (visit.display.match("Visit Note") !== null) {
          saveToStorage("visitNoteProvider", visit);
          this.visitNotePresent = true;
          this.caseNote = true;
          this.show = true;
        }
        if (visit.display.match("Visit Complete") !== null) {
          this.visitCompletePresent = true;
          visit.encounterProviders[0].provider.attributes.forEach((element) => {
            if (element.attributeType.display === "textOfSign") {
              this.text = element.value;
            }
            if (element.attributeType.display === "fontOfSign") {
              this.font = element.value;
            }
          });
        }
      });
    });
   
  }

  get isVisitSummaryChanged() {
    return !this.diagnosisService.isVisitSummaryChanged;
  }

  onStartVisit() {
    const myDate = new Date(Date.now() - 30000);
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    // const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    if (!this.visitNotePresent) {
      this.caseNote = true;
      const userDetails = getFromStorage("user");
      const providerDetails = getFromStorage("provider");
      const attributes = providerDetails.attributes;
      if (userDetails && providerDetails) {
        const providerUuid = providerDetails.uuid;
        const json = {
          patient: patientUuid,
          encounterType: "d7151f82-c1f3-4152-a605-2f9ea7414a79",
          encounterProviders: [
            {
              provider: providerUuid,
              encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03",
            },
          ],
          visit: this.visitUUID,
          encounterDatetime: myDate,
        };
        this.service.postEncounter(json).subscribe((response) => {
          if (response) {
            this.visitService
              .fetchVisitDetails(this.visitUUID)
              .subscribe((visitDetails) => {
                saveToStorage("visitNoteProvider", visitDetails.encounters[0]);
              });
            this.show = true;
            this.snackbar.open(`Visit Note Created`, null, { duration: 4000 });
            attributes.forEach((element) => {
              if (
                element.attributeType.uuid ===
                  "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
                !element.voided
              ) {
                const payload = {
                  speciality: element.value,
                  patient: {
                    name: response.patient.display,
                    provider: response.encounterProviders[0].display,
                  },
                  skipFlag: true,
                };
                // if(!this.pushNotificationService.snoozeTimeout){
                //   this.pushNotificationService.postNotification(payload).subscribe();
                // }
              }
            });
          } else {
            this.snackbar.open(`Visit Note Not Created`, null, {
              duration: 4000,
            });
          }
          this.diagnosisService.isVisitSummaryChanged = false;
        });
      } else {
        this.authService.logout();
      }
    }
  }

  sign() {
    // this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService.getObsAll(this.patientId).subscribe((response) => {
      if (response) {
        this.signandsubmit();
        // this.updateVisit();
      }
    });
  }

  getChiefComplaint(complaint) {
    if(complaint && complaint.observation.match("Domestic Violence") !== null && complaint.observation.match("Safe abortion") !== null  && complaint.visitStatus ==="Active") {
      this.isFollowUpComplaint = true;
    }
  }

  updateVisit() {
    // this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    let URL = `${this.baseURL}/visit/${this.visitUUID}`;

    const myDate = new Date(Date.now() - 30000);
    const json = {
      stopDatetime: myDate,
    };
    this.http.post(URL, json).subscribe((response) => {
      // this.sendSms();
    });
  }

  signandsubmit() {
    const myDate = new Date(Date.now() - 30000);
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    // const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    let URL = `${this.baseURL}/visit/${this.visitUUID}`;

    const userDetails = getFromStorage("user");
    const providerDetails = getFromStorage("provider");
    if (userDetails && providerDetails) {
      this.doctorDetails = providerDetails;
      this.getDoctorValue();
      const providerUuid = providerDetails.uuid;
      if (providerUuid === getEncounterProviderUUID()) {
        this.service.signRequest(providerUuid).subscribe((res) => {
          if (res.results.length) {
            res.results.forEach((element) => {
              if (element.attributeType.display === "textOfSign") {
                this.text = element.value;
              }
              if (element.attributeType.display === "fontOfSign") {
                this.font = element.value;
              }
            });
            const json = {
              patient: patientUuid,
              encounterType: "bd1fbfaa-f5fb-4ebd-b75c-564506fc309e",
              encounterProviders: [
                {
                  provider: providerUuid,
                  encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03",
                },
              ],
              visit: this.visitUUID,
              encounterDatetime: myDate,
              obs: [
                {
                  concept: "7a9cb7bc-9ab9-4ff0-ae82-7a1bd2cca93e",
                  value: JSON.stringify(this.doctorValue),
                },
              ],
            };
            this.service.postEncounter(json).subscribe((post) => {
              this.visitCompletePresent = true;
            });
            if (this.isFollowUpComplaint) {
              // this.sendSms(); 
             } else {
              this.updateVisit();
            } 
          } else {
            if (
              window.confirm(
                'Your signature is not setup! If you click "Ok" you would be redirected. Cancel will load this website '
              )
            ) {
              this.router.navigateByUrl("/myAccount");
            }
          }
        });
      } else {
        this.snackbar.open("Another agent is viewing this case", null, {
          duration: 4000,
        });
      }
    } else {
      this.authService.logout();
    }
  }

  getDoctorValue = () => {
    const doctor = {};
    doctor["name"] = this.doctorDetails.person.display;
    // tslint:disable-next-line: max-line-length
    const doctorAttributes = [
      "phoneNumber",
      "qualification",
      "whatsapp",
      "emailId",
      "registrationNumber",
      "specialization",
      "address",
      "fontOfSign",
      "textOfSign",
    ];
    doctorAttributes.forEach((attr) => {
      const details = this.filterAttributes(
        this.doctorDetails.attributes,
        attr
      );
      if (details.length) {
        doctor[attr] = details[details.length - 1].value;
      }
    });
    this.doctorValue = doctor;
  };

  filterAttributes = (data, text) => {
    return data.filter(
      (attr) =>
        attr.attributeType["display"].toLowerCase() === text.toLowerCase()
    );
  };

  // sendSms() {
  //   const userDetails = getFromStorage("provider");
  //   this.visitService.patientInfo(this.patientId).subscribe((info) => {
  //     var patientInfo = {
  //       name: info.person.display,
  //       age: info.person.age,
  //       gender: info.person.gender,
  //       providerName: userDetails.person.display,
  //     };
  //     let patientNo = info.person.attributes.find(
  //       (a) => a.attributeType.display == "Telephone Number"
  //     );
  //       let link = this.getLink(info);
  //       this.visitService.shortUrl(link).subscribe((res: { data }) => {
  //         const hash = res.data.hash;
  //         const shortLink = this.getLinkFromHash(hash);
  //         let smsText: string = `MSF Arogya Bharat Project Dear ${patientInfo.name} Your prescription is available to download at ${shortLink} - Powered by Intelehealth`;
  //         this.visitService.sendSMS(patientNo.value, smsText).subscribe(
  //           (res) => {
  //             this.openDialog();
  //           },
  //           () => {
  //             this.snackbar.open(`Error while sending SMS`, null, {
  //               duration: 4000,
  //             });
  //           }
  //         );
  //       });
  //   });
  // }

  // getLink(info) {
  //   return `${window.location.protocol}//${window.location.hostname}/preApi/i.jsp?v=${this.visitUuid}&pid=${info.identifiers[0].identifier}`;
  // }

  // getLinkFromHash(hash) {
  //   return `${window.location.protocol}//${window.location.hostname}/intelehealth/#/l/${hash}`;
  // }

  openDialog() {
    this.confirmDialogService
      .openConfirmDialog("Prescription is sent to patient", true)
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.router.navigateByUrl("/home");
        }
      });
  }
}
