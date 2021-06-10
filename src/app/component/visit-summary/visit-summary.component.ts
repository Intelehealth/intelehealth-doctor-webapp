import { VisitService } from "../../services/visit.service";
import { Component, OnInit } from "@angular/core";
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
  baseURL = environment.baseURL;

  show = false;
  text: string;
  font: string;
  visitNotePresent = false;
  visitCompletePresent = false;
  setSpiner = true;
  doctorDetails;
  doctorValue;
  diagnosis: any = [];
  patientId: string;
  visitUuid: string;
  userRole: any;
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
    console.log("this.userRole: ", this.userRole);

    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
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
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService.fetchVisitDetails(visitUuid).subscribe((visitDetails) => {
      visitDetails.encounters.forEach((visit) => {
        if (visit.display.match("Visit Note") !== null) {
          saveToStorage("visitNoteProvider", visit);
          this.visitNotePresent = true;
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
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    if (!this.visitNotePresent) {
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
          visit: visitUuid,
          encounterDatetime: myDate,
        };
        this.service.postEncounter(json).subscribe((response) => {
          if (response) {
            this.visitService
              .fetchVisitDetails(visitUuid)
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
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.patientId = this.route.snapshot.params["patient_id"];
    this.diagnosisService.getObsAll(this.patientId).subscribe((response) => {
      if (response) {
        this.signandsubmit();
        // this.updateVisit();
      }
    });
  }

  updateVisit() {
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    let URL = `${this.baseURL}/visit/${this.visitUuid}`;

    const myDate = new Date(Date.now() - 30000);
    const json = {
      stopDatetime: myDate,
    };
    this.http.post(URL, json).subscribe((response) => {
      this.sendSms();
    });
  }

  signandsubmit() {
    const myDate = new Date(Date.now() - 30000);
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    let URL = `${this.baseURL}/visit/${this.visitUuid}`;

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
              visit: visitUuid,
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

            this.updateVisit();
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
        this.snackbar.open("Another doctor is viewing this case", null, {
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

  sendSms() {
    const userDetails = getFromStorage("provider");
    this.visitService.patientInfo(this.patientId).subscribe((info) => {
      var patientInfo = {
        name: info.person.display,
        age: info.person.age,
        gender: info.person.gender,
        providerName: userDetails.person.display,
      };
      let patientNo = info.person.attributes.find(
        (a) => a.attributeType.display == "Telephone Number"
      );

      this.diagnosisService.getObsAll(this.patientId).subscribe((response) => {
        let currentVisit = response.results.filter(
          (a) => a.encounter?.visit?.uuid == this.visitUuid
        );
        let diagnosisConcept = this.getText(
          currentVisit.filter(
            (a) => a.concept.uuid == "537bb20d-d09d-4f88-930b-cc45c7d662df"
          )
        );
        let followUpConcept = this.getText(
          currentVisit.filter(
            (a) => a.concept.uuid == "e8caffd6-5d22-41c4-8d6a-bc31a44d0c86"
          )
        );
        let preTestConcept = this.getText(
          currentVisit.filter(
            (a) => a.concept.uuid == "23601d71-50e6-483f-968d-aeef3031346d"
          )
        );
        let advConcept = currentVisit.filter(
          (a) => a.concept.uuid == "67a050c1-35e5-451c-a4ab-fff9d57b0db1"
        );
        advConcept.forEach((c, index) => {
          if (c.value.includes("<a")) {
            advConcept.splice(index, 1);
          }
        });
        advConcept = this.getText(advConcept);
        let medicationConcept = this.getText(
          response.results.filter(
            (a) => a.concept.uuid == "c38c0c50-2fd2-4ae3-b7ba-7dd25adca4ca"
          )
        );
        //need to change this link
        let link = this.getLink(info);
        this.visitService.shortUrl(link).subscribe((res: { data }) => {
          const hash = res.data.hash;
          const shortLink = this.getLinkFromHash(hash);
          let smsText: string = `e-prescription Ekal Helpline \n ${patientInfo.name} \n Age: ${patientInfo.age} | Gender: ${patientInfo.gender}  \n Diagnosis \n ${diagnosisConcept}
            \n Medication(s) plan \n ${medicationConcept} \n Recommended Investigation(s) \n ${preTestConcept} \n Advice \n ${advConcept}
            \n Follow Up Date \n ${followUpConcept} \n ${patientInfo.providerName} \n +911141236457 \n Download complete prescription from link below \n ${shortLink}
            \n - Powered by Intelehealth`;
          smsText.replace("\n", "<br>");
          this.visitService.sendSMS(patientNo.value, smsText).subscribe(
            (res) => {
              this.openDialog();
            },
            () => {
              this.snackbar.open(`Error while sending SMS`, null, {
                duration: 4000,
              });
            }
          );
        });
      });
    });
  }

  getLink(info) {
    return `${window.location.protocol}//${window.location.hostname}/preApi/i.jsp?v=${this.visitUuid}&pid=${info.identifiers[0].identifier}`;
  }

  getLinkFromHash(hash) {
    return `${window.location.protocol}//${window.location.hostname}/intelehealth/#/l/${hash}`;
  }

  getText(data) {
    let text: string = "";
    if (data.length > 0) {
      data.forEach((element) => {
        text += element.value + "\n";
      });
    } else {
      text = "No Data Available";
    }
    return text;
  }

  openDialog() {
    this.confirmDialogService
      .openConfirmDialog("Prescription is sent to patient")
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.router.navigateByUrl("/home");
        }
      });
  }
}
