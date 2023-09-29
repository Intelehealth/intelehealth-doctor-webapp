import { VisitService } from "../../services/visit.service";
import { Component, OnInit } from "@angular/core";
import { EncounterService } from "src/app/services/encounter.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { CoreService } from "src/app/services/core.service";
declare var getFromStorage: any,
  saveToStorage: any;

@Component({
  selector: "app-visit-summary",
  templateUrl: "./visit-summary.component.html",
  styleUrls: ["./visit-summary.component.css"],
})
export class VisitSummaryComponent implements OnInit {
  show = false;
  text: string;
  font: string;
  visitNotePresent = false;
  visitCompletePresent = false;
  PatientExitSurveyPresent = false;
  setSpiner = true;
  doctorDetails;
  doctorValue;
  diagnosis: any = [];
  managerRoleAccess = false;
  patientId: string;
  visitUuid: string;
  isSevikaVisit = false;
  isSameProvider = false;
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
    "d63ae965-47fb-40e8-8f08-1f46a8a60b2b"
  ];
  roleAccess: any;
  visit: any;
  videoIcon = "assets/svgs/video-w.svg";

  constructor(
    private service: EncounterService,
    private visitService: VisitService,
    private authService: AuthService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    private diagnosisService: DiagnosisService,
    private cs: CoreService
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

    if (userDetails) {
      const roles = userDetails['roles'];
      roles.forEach(role => {
        if (role.name === "Project Manager" || role.name === "Reporting Module") {
          this.managerRoleAccess = true;
        }
      });
    }
    this.patientId = this.route.snapshot.paramMap.get("patient_id");

    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService.fetchVisitDetails(this.visitUuid).subscribe((visitDetails) => {
      this.visit = visitDetails;
      if (Array.isArray(visitDetails.attributes)) {
        this.isSevikaVisit = !!visitDetails.attributes.find(atr => atr.value === 'Specialist doctor not needed')
      }
      visitDetails.encounters.forEach((visit) => {
        if (visit.display.match("Visit Note") !== null) {
          this.setSameProvider(visit)
          saveToStorage("visitNoteProvider", visit);
          this.visitNotePresent = true;
          this.show = true;
          const ObsData = visit.obs.filter(a => a.display.match("TELEMEDICINE DIAGNOSIS"));
          if (ObsData.length > 0) {
            this.diagnosisService.isVisitSummaryChanged = true
          }
          else {
            this.diagnosisService.isVisitSummaryChanged = false
          }
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
        if (
          visit.display.includes("ADULTINITIAL") |
          visit.display.includes("Vitals")
        ) {
          saveToStorage("patientVisitProvider", visit.encounterProviders[0]);
        }
        if (visit.display.match("Patient Exit Survey") !== null) {
          this.PatientExitSurveyPresent = true;
        }
      });
    });
  }

  get isVisitSummaryChanged() {
    return !this.diagnosisService.isVisitSummaryChanged;
  }

  get requiredNotFilled() {
    return !this.diagnosisService.diagnosisExists;
  }

  setSameProvider(visit: any) {
      let localProvider = localStorage.getItem("provider");
      if (localProvider !== null) {
        localProvider = JSON.parse(localProvider) as any;
        const uuid = localProvider['uuid'];
        if (visit.encounterProviders.length > 0) {
          const encounterProvider = visit.encounterProviders[0];
          const provider = encounterProvider.provider;
          if (provider) {
            this.isSameProvider = uuid === provider.uuid
          }
        }
      }
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
        this.setSpiner = true;
        this.visitService.fetchVisitDetails(visitUuid).subscribe((visitDetails) => {
          this.isSameProvider = true;
          let visitNote = visitDetails.encounters.find((visit) => (visit.display.match("Visit Note") !== null));
          if (visitNote) {
            this.diagnosisService.isSameDoctor();
            this.setSpiner = false;
          } else {
            this.startVisitNote(providerDetails, patientUuid, visitUuid, myDate, attributes);
            this.setSpiner = false;
          }
        });
      } else {
        this.authService.logout();
      }
    }
  }

  sign() {
    this.signandsubmit();
  }

  get user() {
    return getFromStorage("user");
  }

  signandsubmit() {
    const myDate = new Date(Date.now() - 30000);
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const visitUuid = this.route.snapshot.paramMap.get("visit_id");
    const userDetails = getFromStorage("user");
    const providerDetails = getFromStorage("provider");
    if (userDetails && providerDetails) {
      this.doctorDetails = providerDetails;
      this.getDoctorValue();
      const providerUuid = providerDetails.uuid;
      if (this.diagnosisService.isSameDoctor()) {
        this.setSpiner = true;
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
              this.setSpiner = false;
              this.snackbar.open("Visit Complete", null, { duration: 4000 });
            });
          } else {
            this.setSpiner = false;
            if (
              window.confirm(
                'Your signature is not setup! If you click "Ok" you would be redirected. Cancel will load this website '
              )
            ) {
              this.router.navigateByUrl("/myAccount");
            }
          }
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

  /**
  * show reminder to doctor if he is idle after starting the visit
  * @param visitUuid string
  */
  showReminder(visitUuid: string) {
    this.visitService.fetchVisitDetails(visitUuid).subscribe((visitDetails) => {
      if (!this.checkVisit(visitDetails.encounters, "Visit Complete") && this.router.url.includes('visitSummary')
        && visitUuid === this.router.url.split('/')[3]) {
        var data = "Patient " + visitDetails.patient.person.display + " is waiting, Please provide prescription.";
        window.confirm(data);
      }
    });
  }

  /**
   * Check for encounter as per visit type passed
   * @param encounters Array
   * @param visitType String
   * @returns Object | null
   */
  checkVisit(encounters, visitType) {
    return encounters.find(({ display = '' }) => display.includes(visitType));
  }

  openVcModal() {
    this.cs.openVideoCallModal({
      patientId: this.patientId,
      visitId: this.visitUuid,
      connectToDrId: this.user?.uuid,
      patientName: this.visit?.patient?.person?.display,
      patientPersonUuid: this.visit?.patient?.uuid,
      patientOpenMrsId: this.visit.patient?.identifiers?.[0]?.identifier,
      initiator: 'dr'
    });
    // this.dialog.open(VcComponent, {
    //   disableClose: true,
    //   data: {
    //     patientUuid: this.patientId,
    //   },
    // });
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
            // if(!this.pushNotificationService.snoozeTimeout){
            //   this.pushNotificationService.postNotification(payload).subscribe();
            // }
          }
        });
        setTimeout(() => {
          this.showReminder(visitUuid);
        }, 900000);
      } else {
        this.snackbar.open(`Visit Note Not Created`, null, {
          duration: 4000,
        });
      }
      this.diagnosisService.isVisitSummaryChanged = false;
    });
  }

  openChatModal() {
    this.cs.openChatBoxModal({
      patientId: this.visit.patient.uuid,
      visitId: this.visit.uuid,
      patientName: this.visit?.patient?.person?.display,
      patientPersonUuid: this.visit?.patient?.uuid,
      patientOpenMrsId: this.visit?.patient?.identifiers?.[0]?.identifier,
    });
  }
}
