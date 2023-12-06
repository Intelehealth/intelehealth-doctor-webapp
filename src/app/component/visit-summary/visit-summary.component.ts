import { PushNotificationsService } from "src/app/services/push-notification.service";
import { VisitService } from "../../services/visit.service";
import { Component, OnInit } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { VcComponent } from "../vc/vc.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { ConfirmDialogService } from "./reassign-speciality/confirm-dialog/confirm-dialog.service";
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { VideoCallComponent } from "../video-call/video-call.component";
import { ChatBoxComponent } from "../chat-box/chat-box.component";
declare var getFromStorage: any,
  saveToStorage: any,
  getEncounterProviderUUID: any;

@Component({
  selector: "app-visit-summary",
  templateUrl: "./visit-summary.component.html",
  styleUrls: ["./visit-summary.component.css"],
})
export class VisitSummaryComponent implements OnInit {
  conceptFollow = 'e8caffd6-5d22-41c4-8d6a-bc31a44d0c86';
  show = false;
  text: string;
  font: string;
  visitNotePresent = false;
  visitCompletePresent = false;
  isVisitSummaryChanged: boolean = false
  isVisitEnded:boolean = false;
  setSpiner = true;
  doctorDetails;
  doctorValue;
  patientUuid = "";
  visitUuid = "";
  videoIcon = environment.production
    ? "../../../intelehealth/assets/svgs/video-w.svg"
    : "../../../assets/svgs/video-w.svg";
  isManagerRole: boolean = false;
  onSubmit = false;
  visit: any = null;
  dialogRef1: MatDialogRef<ChatBoxComponent>;
  dialogRef2: MatDialogRef<VideoCallComponent>;
  isCalling: boolean = false;


  constructor(
    private service: EncounterService,
    private visitService: VisitService,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private pushNotificationService: PushNotificationsService,
    private dialog: MatDialog,
    private dialogService: ConfirmDialogService,
    private diagnosisService: DiagnosisService,
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    setTimeout(() => {
      this.setSpiner = false;
    }, 1000);
    this.patientUuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.checkProviderRole();
    this.checkMadnatoryTabs();
    this.visitService
      .fetchVisitDetails(this.visitUuid)
      .subscribe((visitDetails) => {
        visitDetails.encounters.forEach((visit) => {
          if (visit.display.match("Visit Note") !== null) {
            saveToStorage("visitNoteProvider", visit);
            this.visitNotePresent = true;
            this.show = true;
          }
          if (visit.display.match("Visit Complete") !== null) {
            this.visitCompletePresent = true;
            visit.encounterProviders[0].provider.attributes.forEach(
              (element) => {
                if (element.attributeType.display === "textOfSign") {
                  this.text = element.value;
                }
                if (element.attributeType.display === "fontOfSign") {
                  this.font = element.value;
                }
              }
            );
          }
          if (
            visit.display.includes("ADULTINITIAL") |
            visit.display.includes("Vitals")
          ) {
            saveToStorage("patientVisitProvider", visit.encounterProviders[0]);
          }
          if (visitDetails.stopDatetime !== null) {
            this.isVisitEnded = true;
          }
        });
        this.visit = visitDetails;
      });
  }

  onStartVisit() {
    const myDate = new Date(Date.now() - 30000);
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    const userDetails = getFromStorage("user");
    const providerDetails = getFromStorage("provider");
    const attributes = providerDetails.attributes;
    if (userDetails && providerDetails) {
      this.setSpiner = true;
      this.visitService.fetchVisitDetails(visitUuid).subscribe((visitDetails) => {
        let visitNote = visitDetails.encounters.find((visit) => (visit.display.match("Visit Note") !== null));
        if (visitNote) {
          this.setSpiner = false;
          this.snackbar.open("Another doctor is viewing this case", null, {
            duration: 4000,
          });
        } else {
          this.setSpiner = false;
          this.startVisitNote(providerDetails, patientUuid, visitUuid, myDate, attributes);
        }
      });
    } else {
      this.authService.logout();
    }
  }

  sign() {
    const myDate = new Date(Date.now() - 30000);
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
              patient: this.patientUuid,
              encounterType: "bd1fbfaa-f5fb-4ebd-b75c-564506fc309e",
              encounterProviders: [
                {
                  provider: providerUuid,
                  encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03",
                },
              ],
              visit: this.visitUuid,
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
              this.router.navigateByUrl("/home");
              this.snackbar.open("Visit Complete", null, { duration: 4000 });
            });
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
    this.onSubmit = !this.onSubmit
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

  openVcModal() {
    const dialogRef = this.dialogService.openConfirmDialog("Confirm the strong 3G internet connection to make this call")
      .afterClosed().subscribe(res => {
        if (res) {
          const userDetails = getFromStorage('user');
    
          this.dialog.open(VideoCallComponent, {
            id: 'video-call',
            panelClass: 'vc-modal-lg',
            disableClose: true,
            data: {
              patientId: this.patientUuid,
              visitId: this.visitUuid,
              connectToDrId: userDetails.uuid,
              patientName: this.visitService.patient.person.display,
              patientPersonUuid: this.visitService.patient.person.uuid,
              patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID'),
              initiator: 'dr',
              drPersonUuid: this.doctorDetails?.person.uuid,
              patientAge: this.visitService.patient.person.age,
              patientGender: this.visitService.patient.person.gender
            },
          });
        }
      });
  }

  /**
  * Start chat with HW/patient
  * @return {void}
  */
  startChat() {
    if (this.dialogRef1) {
      this.dialogRef1.close();
      this.isCalling = false;
      return;
    }
    this.isCalling = true;
    this.dialogRef1 = this.dialog.open(ChatBoxComponent, {
      panelClass: ["chatbot-container","chatbot-container-mobile"], 
      backdropClass: "chatbot-backdrop",
      width: "100%", maxHeight: "500px", maxWidth: "300px", position: { bottom: "80px", right: "20px" },
      data: {
        patientId: this.visit.patient.uuid,
        visitId: this.visit.uuid,
        patientName: this.visitService.patient.person.display,
        patientPersonUuid: this.visitService.patient.person.uuid,
        patientOpenMrsId: this.getPatientIdentifier('OpenMRS ID')
      }
    });

    this.dialogRef1.afterClosed().subscribe((res) => {
      this.dialogRef1 = undefined;
      this.isCalling = false;
    });
  }


  /**
  * Get patient identifier for given identifier type
  * @param {string} identifierType - Identifier type
  * @return {void}
  */
  getPatientIdentifier(identifierType: string): string {
    let identifier: string = '';
    if (this.visitService.patient) {
      this.visitService.patient.identifiers.forEach((idf: any) => {
        if (idf.identifierType.display === identifierType) {
          identifier = idf.identifier;
        }
      });
    }
    return identifier;
  }

  private checkProviderRole() {
    const userDetails = getFromStorage('user');
    if (userDetails) {
      const roles = userDetails['roles'];
      roles.forEach(role => {
        if (role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a" ||
          role.uuid === "90ec258d-f82b-4f4a-8e10-32e4b3cc38a2") {
          this.isManagerRole = true;
        }
      });
    }
  }


  private startVisitNote(providerDetails: any, patientUuid: string, visitUuid: string, myDate: Date, attributes: any) {
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
        this.visitNotePresent = true;
        this.visitService
          .fetchVisitDetails(visitUuid)
          .subscribe((visitDetails) => {
            saveToStorage("visitNoteProvider", visitDetails.encounters[0]);
          });
        this.show = true;
        this.snackbar.open(`Visit Note Created`, null, { duration: 4000 });
        attributes.forEach((element) => {
          if (element.attributeType.uuid ===
            "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
            !element.voided) {
            const payload = {
              speciality: element.value,
              patient: {
                name: response.patient.display,
                provider: response.encounterProviders[0].display,
              },
              skipFlag: true,
            };
            if (!this.pushNotificationService.snoozeTimeout) {
              this.pushNotificationService
                .postNotification(payload)
                .subscribe();
            }
          }
        });
      } else {
        this.snackbar.open(`Visit Note Not Created`, null, {
          duration: 4000,
        });
      }
    });
  }

  getIsDataPresent() {
    this.checkMadnatoryTabs();
  }

  checkMadnatoryTabs() {
    this.diagnosisService.getObs(this.patientUuid, this.conceptFollow)
      .subscribe(response => {
        let followUp = [];
        response.results.forEach(obs => {
          if (obs.encounter.visit.uuid === this.visitUuid) {
            followUp.push(obs);
          }
        });
        if (followUp.length > 0) {
          this.isVisitSummaryChanged = false;
        } else {
          this.isVisitSummaryChanged = true;
        }
      });
  }
}
