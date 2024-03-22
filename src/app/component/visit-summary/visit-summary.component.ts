import { PushNotificationsService } from "src/app/services/push-notification.service";
import { VisitService } from "../../services/visit.service";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { VcComponent } from "../vc/vc.component";
import { MatDialog } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { TranslationService } from "src/app/services/translation.service";
import { browserRefresh } from 'src/app/app.component';
import { ConfirmDialogService } from "./reassign-speciality/confirm-dialog/confirm-dialog.service";
import { CoreService } from "src/app/services/core/core.service";
import { SocketService } from "src/app/services/socket.service";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from "rxjs";
import { AdditionalCommentComponent } from './additional-comment/additional-comment.component';
import { DiagnosisComponent } from './diagnosis/diagnosis.component';
import { FollowUpComponent } from './follow-up/follow-up.component';
import { PrescribedTestComponent } from './prescribed-test/prescribed-test.component';
import { PrescribedMedicationComponent } from './prescribed-medication/prescribed-medication.component';
import { DischargeOrderComponent } from './discharge-order/discharge-order.component';
import { AdviceComponent } from './advice/advice.component';
import { PatientInteractionComponent } from './patient-interaction/patient-interaction.component';
import { AidOrderComponent } from "../visit-summary/aid-order/aid-order.component";
import { ComfirmationDialogService } from "./confirmation-dialog/comfirmation-dialog.service";
declare var getFromStorage: any, deleteFromStorage: any, saveToStorage: any, getEncounterProviderUUID: any;

@Component({
  selector: "app-visit-summary",
  templateUrl: "./visit-summary.component.html",
  styleUrls: ["./visit-summary.component.css"],
})
export class VisitSummaryComponent implements OnInit, OnDestroy {
  show = false;
  text: string;
  font: string;
  visitNotePresent = false;
  visitCompletePresent = false;
  setSpiner = true;
  doctorDetails;
  doctorValue;
  patientUuid = "";
  visitUuid = "";
  videoIcon = environment.production
    ? "../../../intelehealth/assets/svgs/video-w.svg"
    : "../../../assets/svgs/video-w.svg";
  isManagerRole = false;
  visitSpeciality: any;
  visitSpecialitySecondary: any;
  userSpeciality: any;
  isVisitNoteEncProvider = false;
  isSameSpecialityDoctorViewingVisit = false;
  isAdminister = false;
  isDispense = false;
  isCollectedBy = false;
  isReceiveBy = false;
  visit: any;
  chatBoxRef: any;

  eventsSubject: Subject<void> = new Subject<void>();
  @ViewChild(AdditionalCommentComponent) childComponentAdditionalComment!: AdditionalCommentComponent;
  @ViewChild(DiagnosisComponent) childComponentDiagnosis!: DiagnosisComponent;
  @ViewChild(FollowUpComponent) childComponentFollowUp!: FollowUpComponent;
  @ViewChild(PrescribedTestComponent) childComponentPrescribedTest!: PrescribedTestComponent;
  @ViewChild(PrescribedMedicationComponent) childComponentPrescribedMedication!: PrescribedMedicationComponent;
  @ViewChild(DischargeOrderComponent) childComponentDischargeOrder!: DischargeOrderComponent;
  @ViewChild(AdviceComponent) childComponentAdvice!: AdviceComponent;
  @ViewChild(PatientInteractionComponent) childComponentPatient!: PatientInteractionComponent;
  @ViewChild(AidOrderComponent) childComponentAidOrder!: AidOrderComponent;

  constructor(
    private service: EncounterService,
    private visitService: VisitService,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private pushNotificationService: PushNotificationsService,
    private dialog: MatDialog,
    private translationService: TranslationService,
    private dialogService: ConfirmDialogService,
    private cs: CoreService,
    private socketSvc: SocketService,
    private toastr: ToastrService,
    private translateService: TranslateService,
    private ComfirmationDialogService: ComfirmationDialogService
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
  }

  ngOnInit() {
    setTimeout(() => {
      this.setSpiner = false;
    }, 1000);
    this.checkProviderRole();
    this.patientUuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService
      .fetchVisitDetails(this.visitUuid)
      .subscribe((visitDetails) => {
        this.visit = visitDetails;
        this.visitSpeciality = visitDetails.attributes.find(a => a.attributeType.uuid == "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d").value;
        this.visitSpecialitySecondary = visitDetails.attributes.find(a => a.attributeType.uuid == "8100ec1a-063b-47d5-9781-224d835fc688")?.value;
        const providerDetails = getFromStorage("provider");
        this.userSpeciality = providerDetails.attributes.find(a => a.attributeType.display == "specialization").value;
        visitDetails.encounters.forEach((visit) => {
          if (visit.display.match("Visit Note") !== null) {
            saveToStorage("visitNoteProvider", visit);
            this.visitNotePresent = true;
            for (let j = 0; j < visit.encounterProviders.length; j++) {
              if (visit.encounterProviders[j].provider.uuid == providerDetails.uuid) {
                this.isVisitNoteEncProvider = true;
              }
              for (let x = 0; x < visit.encounterProviders[j].provider.attributes.length; x++) {
                if (visit.encounterProviders[j].provider.attributes[x].value == this.userSpeciality && visit.encounterProviders[j].provider.attributes[x].voided == false) {
                  this.isSameSpecialityDoctorViewingVisit = true;
                  break;
                }
              }
            }
            if (this.isVisitNoteEncProvider) {
              this.show = true;
            }
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
          if(visit.display.includes("DISPENSE")){
            this.isDispense = true
          }
          if(visit.display.includes("ADMINISTER")){
            this.isAdminister = true
          }
          if(visit.display.includes("ENCOUNTER_TEST_COLLECT")){
            this.isCollectedBy = true
          }
          if(visit.display.includes("ENCOUNTER_TEST_RECEIVE")){
            this.isReceiveBy = true
          }
        });
        const openChat: string = this.route.snapshot.queryParamMap.get('openChat');
        if (openChat === 'true') {
          this.openChatModal();
        }  
      });
    this.translationService.getSelectedLanguage();
    if (browserRefresh) {
      this.translationService.changeCssFile(localStorage.getItem("selectedLanguage"));
    }
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
  }

  onStartVisit() {
    const myDate = new Date(Date.now() - 30000);
    if (!this.visitNotePresent) {
      const userDetails = getFromStorage("user");
      const providerDetails = getFromStorage("provider");
      const attributes = providerDetails.attributes;
      if (userDetails && providerDetails) {
        const providerUuid = providerDetails.uuid;
        const json = {
          patient: this.patientUuid,
          encounterType: "d7151f82-c1f3-4152-a605-2f9ea7414a79",
          encounterProviders: [
            {
              provider: providerUuid,
              encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03",
            },
          ],
          visit: this.visitUuid,
          encounterDatetime: myDate,
        };
        this.service.postEncounter(json).subscribe((response) => {
          if (response) {
            this.visitNotePresent = true;
            this.visitService
              .fetchVisitDetails(this.visitUuid)
              .subscribe((visitDetails) => {
                saveToStorage("visitNoteProvider", visitDetails.encounters[0]);
              });
            this.show = true;
            this.isVisitNoteEncProvider = true;
            this.translationService.getTranslation(`Visit Note Created`);
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
                if (!this.pushNotificationService.snoozeTimeout) {
                  this.pushNotificationService
                    .postNotification(payload)
                    .subscribe();
                }
              }
            });
          } else {
            this.translationService.getTranslation(`Visit Note Not Created`);
          }
        });
      } else {
        this.authService.logout();
      }
    } else {
      const encounterDetails = getFromStorage("visitNoteProvider");
      const providerDetails = getFromStorage("provider");
      if (encounterDetails && providerDetails) {
        const providerUuid = providerDetails.uuid;
        const encounterUuid = encounterDetails.uuid;

        const json = {
          provider: providerUuid,
          encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e03"
        };
        this.service.postEncounterProvider(encounterUuid, json).subscribe((res: any) => {
          window.location.reload();
          this.isVisitNoteEncProvider = true;
          this.show = true;
        });
      }
    }
    setTimeout(() => {
      this.translationService.getTranslation("Data will not be save until click's 'Save' or 'Complete Prescription' button.");
    }, 4000);
  }

  sign() {
    this.dialogService.openConfirmDialog("Are you sure to complete this visit? Once completed prescription can not be edited.")
      .afterClosed().subscribe(res => {
        if (res) {
          const myDate = new Date(Date.now() - 30000);
          const userDetails = getFromStorage("user");
          const providerDetails = getFromStorage("provider");
          if (userDetails && providerDetails) {
            this.doctorDetails = providerDetails;
            this.getDoctorValue();
            const providerUuid = providerDetails.uuid;
            if (this.isVisitNoteEncProvider) {
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
                    this.translationService.getTranslation("Visit Complete");
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
              this.translationService.getTranslation("Another doctor is viewing this case");
            }
          } else {
            this.authService.logout();
          }
        }
      });
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

  get user() {
    return getFromStorage("user");
  }

  openVcModal() {
    // const hw = this.socketSvc.activeUsers.find(u => u?.uuid === this.getPatientVisitProvider()?.provider?.uuid);
    // if (!hw) {
    //   this.toastr.error(this.translateService.instant(`messages.${"Please try again later."}`), this.translateService.instant(`messages.${"Health Worker is offline."}`));
    //   return;
    // }
    this.cs.openVideoCallModal({
      patientId: this.patientUuid,
      visitId: this.visitUuid,
      connectToDrId: this.user?.uuid,
      patientName: this.visit?.patient?.person?.display,
      patientPersonUuid: this.visit?.patient?.uuid,
      patientOpenMrsId: this.visit.patient?.identifiers?.[0]?.identifier,
      initiator: 'dr'
    });
  }

  private checkProviderRole() {
    const userDetails = getFromStorage('user');
    if (userDetails) {
      const roles = userDetails['roles'];
      roles.forEach(role => {
        if (role.uuid === "f99470e3-82a9-43cc-b3ee-e66c249f320a") {
          this.isManagerRole = true;
        }
      });
    }
  }

  saveData() {
    const tempObsLength = this.childComponentAdditionalComment.getTempCommentLength();
    if (tempObsLength > 0) {
      this.translationService.getTranslation('Data saved successfully');
      this.eventsSubject.next();
    } else {
      this.translationService.getTranslation('Assessment And Plan are compulsory. Please enter at least one note.');
    }
  }

  openChatModal() {
    this.chatBoxRef = this.cs.openChatBoxModal({
      patientId: this.visit?.patient?.uuid,
      visitId: this.visit?.uuid,
      patientName: this.visit?.patient?.person?.display,
      patientPersonUuid: this.visit?.patient?.uuid,
      patientOpenMrsId: this.visit?.patient?.identifiers?.[0]?.identifier,
    });
  }

  ngOnDestroy(): void {
    deleteFromStorage("visitNoteProvider");
  }

  getCacheData(key: string, parse: boolean = false){
    if (parse) {
      return JSON.parse(localStorage.getItem(key));
    } else {
        return localStorage.getItem(key);
    }
  }

  getPatientVisitProvider() {
    try {
        return this.getCacheData('patientVisitProvider', true)
    } catch (error) {
        return null
    }
 }

 canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
  const tempObsAC = this.childComponentAdditionalComment.unSaveChanges();
  const tempObsD = this.childComponentDiagnosis.unSaveChanges();
  const tempObsFU = this.childComponentFollowUp.unSaveChanges();
  const tempObsPT = this.childComponentPrescribedTest.unSaveChanges();
  const tempObsPM = this.childComponentPrescribedMedication.unSaveChanges();
  const tempObsDO = this.childComponentDischargeOrder.unSaveChanges();
  const tempObsA = this.childComponentAdvice.unSaveChanges();
  const tempObsPI = this.childComponentPatient.unSaveChanges();
  const tempObsAid = this.childComponentAidOrder.unSaveChanges();
  
  if (tempObsAC || tempObsD || tempObsFU || tempObsPT || tempObsPM || tempObsDO || tempObsA || tempObsPI || tempObsAid) {
    const dialogRef = this.ComfirmationDialogService.openConfirmDialog("You have unsaved changes, do you want to procced?");
    return dialogRef.afterClosed();
  }
  return true;
}

}
