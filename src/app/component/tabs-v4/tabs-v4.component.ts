import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { VisitSummaryAndPrescriptionModalComponent } from "src/app/modals/visit-summary-and-prescription-modal/visit-summary-and-prescription-modal.component";
import { AuthService } from "src/app/services/auth.service";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { EncounterService } from "src/app/services/encounter.service";
import { VisitService } from "src/app/services/visit.service";
import { ModaldialogComponent } from "../modaldialog/modaldialog.component";
declare var getFromStorage: any,
  saveToStorage: any,
  getEncounterProviderUUID: any;

@Component({
  selector: "app-tabs-v4",
  templateUrl: "./tabs-v4.component.html",
  styleUrls: ["./tabs-v4.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TabsV4Component implements OnInit {
  @ViewChild("VisitSummaryModal") visitSummaryModal: VisitSummaryAndPrescriptionModalComponent;
  visitNotePresent: boolean = false;
  visitCompletePresent: boolean = false;
  show = false;
  patientUuid: string;
  visitUuid: string;
  setSpiner = true;
  constructor(private route: ActivatedRoute,
    private authService: AuthService,
    private visitService: VisitService,
    private modalService: NgbModal,
    private router: Router,
    private encounterService: EncounterService,
    private diagnosisService: DiagnosisService
    ) { }

  ngOnInit(): void {
    this.patientUuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitUuid = this.route.snapshot.paramMap.get("visit_id");
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
          }
          if (
            visit.display.includes("ADULTINITIAL") |
            visit.display.includes("Vitals")
          ) {
            saveToStorage("patientVisitProvider", visit.encounterProviders[0]);
          }
        });
      });
  }

  onStartVisitNote() {
    const myDate = new Date(Date.now() - 30000);
    if (!this.visitNotePresent) {
      const userDetails = getFromStorage("user");
      const providerDetails = getFromStorage("provider");
      const attributes = providerDetails.attributes;
      if (userDetails && providerDetails) {
        this.startVisitNote(providerDetails, this.patientUuid, this.visitUuid, myDate, attributes);
      } else {
        this.authService.logout();
      }
    }
  }

  sign() {
    const modalRef = this.openModal('Share prescription', 'Are you sure you want to share this prescription?', 'Go Back', 'Confirm', "/assets/svgs/prescription.svg");
    modalRef.result.then((result) => {
      this.signPrescription();
    }, (reason) => {
      console.log("no")
    });

  }

  private openModal(title, content, btnname1, btnname2, imgpath) {
    const modalRef = this.modalService.open(ModaldialogComponent);
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.content = content;
    modalRef.componentInstance.btnname1 = btnname1;
    modalRef.componentInstance.btnname2 = btnname2;
    modalRef.componentInstance.imgpath = imgpath;
    return modalRef;
  }

  private signPrescription() {
    const myDate = new Date(Date.now() - 30000);
    const userDetails = getFromStorage("user");
    const providerDetails = getFromStorage("provider");
    if (userDetails && providerDetails) {
      let doctorDetails = this.getDoctorValue(providerDetails);
      const providerUuid = providerDetails.uuid;
      if (this.diagnosisService.isSameDoctor()) {
        this.encounterService.signRequest(providerUuid).subscribe((res) => {
          if (res.results.length) {
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
                  value: JSON.stringify(doctorDetails),
                },
              ],
            };
            this.encounterService.postEncounter(json).subscribe((post) => {
              this.visitCompletePresent = true;
              const modalRef = this.openModal('Shared prescription successfully', 'The prescription has been succsessfully sent. View prescription or go to dashboard'
                , 'View Prescription', 'Go to dashboard', "/assets/svgs/pre-successfully.svg");
              modalRef.result.then((result) => {
                this.router.navigateByUrl("/dashboard");
              }, (reason) => {
                this.visitSummaryModal.openVisitSummaryModal(false);
              });
            },
              (error) => {
                const modalRef = this.openModal('Cannot share prescription', 'Unable to send prescription due to poor network connection. Please try again or come back later'
                  , 'Go Back', 'Try again', "/assets/svgs/fail.svg");
                modalRef.result.then((result) => {

                }, (reason) => {
                  console.log("no")
                });
              });
          } else {
            if (window.confirm(
              'Your signature is not setup! If you click "Ok" you would be redirected. Cancel will load this website '
            )) {
              this.router.navigateByUrl("/myAccount");
            }
          }
        });
      }
      } else {
      this.authService.logout();
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
    this.encounterService.postEncounter(json).subscribe((response) => {
      if (response) {
        this.visitService
          .fetchVisitDetails(visitUuid)
          .subscribe((visitDetails) => {
            saveToStorage("visitNoteProvider", visitDetails.encounters[0]);
          });
        this.show = true;
      }
    });
  }

  getDoctorValue = (doctorDetails) => {
    const doctor = {};
    doctor["name"] = doctorDetails.person.display;
    const doctorAttributes = [
      "phoneNumber",
      "qualification",
      "whatsapp",
      "emailId",
      "registrationNumber",
      "specialization",
      "address",
      "countryCode"
    ];
    doctorAttributes.forEach((attr) => {
      const details = this.filterAttributes(
        doctorDetails.attributes,
        attr
      );
      if (details.length) {
        doctor[attr] = details[details.length - 1].value;
      }
    });
    return doctor;
  };

  filterAttributes = (data, text) => {
    return data.filter(
      (attr) =>
        attr.attributeType["display"].toLowerCase() === text.toLowerCase()
    );
  };
}
