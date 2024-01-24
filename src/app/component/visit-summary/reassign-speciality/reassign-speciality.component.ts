import { Component, OnInit, Inject, Input } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { environment } from "src/environments/environment";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { VisitService } from "src/app/services/visit.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { ConfirmDialogComponent } from "./confirm-dialog/confirm-dialog.component";
import { ConfirmDialogService } from "./confirm-dialog/confirm-dialog.service";
import { PushNotificationsService } from "src/app/services/push-notification.service";
import { EncounterService } from "src/app/services/encounter.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
declare var getFromStorage: any, saveToStorage: any;
@Component({
  selector: "app-reassign-speciality",
  templateUrl: "./reassign-speciality.component.html",
  styleUrls: ["./reassign-speciality.component.css"],
})
export class ReassignSpecialityComponent implements OnInit {
  @Input() isManagerRole : boolean;
  @Input() providerSpeciality : string;
  @Input() visitSpeciality : string;
  @Input() visitSpecialitySecondary : string;

  type = "N";
  patientDetails: any;
  visitUuid = this.route.snapshot.paramMap.get("visit_id");


  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/visit/${this.visitUuid}/attribute`;
  specializations = [
    "Doctor (General Consult)",
    "Cardiology",
    "Pulmonary",
    "GI",
    "Endocrinology",
    "Pediatrics",
    "Surgery",
    "Gyn",
    "Admin"
  ];
  errorText: string;

  updateSpeciality = new FormGroup({
    specialization: new FormControl("", Validators.required),
  });

  visitSpecialityAttribute: any;
  referralHistoryAttribute: any;

  constructor(
    private visitService: VisitService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private dialogService: ConfirmDialogService,
    private pushNotificationService: PushNotificationsService,
    private EncounterService: EncounterService,
    private snackbar: MatSnackBar,
    private translationService: TranslateService
  ) { }

  ngOnInit(): void {
    this.visitService.getVisit(this.visitUuid).subscribe((visitDetails) => {
      this.patientDetails = visitDetails;
      this.visitSpecialityAttribute = this.patientDetails.attributes.find((o: any) => o.attributeType.uuid == '3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d');
      this.referralHistoryAttribute = this.patientDetails.attributes.find((o: any) => o.attributeType.uuid == 'eb2ea3f4-006f-470e-8f1f-0966ab00cd2d');
      // this.updateSpeciality.controls.specialization.setValue(
      //   this.patientDetails.attributes[0].value
      // );
    });
  }

  get txtDirection() {
    return localStorage.getItem("selectedLanguage") === 'ar' ? "rtl" : "ltr";
  }

  Submit() {
    if (this.updateSpeciality.invalid) {
      return;
    }
    const value = this.updateSpeciality.value;
    this.dialogService.openConfirmDialog("Are you sure to re-assign this visit to another doctor?")
      .afterClosed().subscribe(res => {
        if (res) {
          if (value.specialization !== null) {
            if (this.visitSpecialitySecondary == 'Admin' && this.providerSpeciality == 'Admin') {
              this.translationService.get('messages.cantReassign').subscribe((res: string) => {
                this.snackbar.open(res,null, {duration: 4000,direction: this.txtDirection});
              });
              return;
            }
            const URL = this.visitSpecialityAttribute ? `${this.baseURLProvider}/${this.visitSpecialityAttribute.uuid}` : this.baseURLProvider;
            const json = {
              attributeType: "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d",
              value: value.specialization,
            };
            this.http.post(URL, json).subscribe((response1) => {
              // Insert referral History
              const URL2 = this.referralHistoryAttribute ? `${this.baseURLProvider}/${this.referralHistoryAttribute.uuid}` : this.baseURLProvider;
              const json2 = {
                attributeType: "eb2ea3f4-006f-470e-8f1f-0966ab00cd2d",
                value: this.referralHistoryAttribute ? this.referralHistoryAttribute?.value + "-->" + value.specialization : this.visitSpeciality + "-->" + value.specialization
              }
              this.http.post(URL2, json2).subscribe((response2) => {
                this.translationService.get('messages.reassignedSuccessfully', {value: value.specialization}).subscribe((res: string) => {
                  this.snackbar.open(res,null, {duration: 4000,direction: this.txtDirection});
                });
              });
              // this.router.navigate(["/home"]);
              // this.translationService.get('messages.reassignedSuccessfully', {value: value.specialization}).subscribe((res: string) => {
              //   this.snackbar.open(res,null, {duration: 4000});
              // });
              // //* Send Notification
              // const myDate = new Date(Date.now() - 30000);
              // const patientUuid = this.route.snapshot.paramMap.get("patient_id");

              // const providerDetails = getFromStorage("provider");
              // const attributes = providerDetails.attributes;
              // const providerUuid = providerDetails.uuid;

              // const json = {
              //   patient: patientUuid,
              //   encounterType: "8d5b27bc-c2cc-11de-8d13-0010c6dffd0f",
              //   encounterProviders: [
              //     {
              //       provider: providerUuid,
              //       encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e04",
              //     },
              //   ],
              //   visit: this.visitUuid,
              //   encounterDatetime: myDate,
              // };
              // this.EncounterService.postEncounter(json).subscribe((response) => {
              //   if (response) {
              //     this.visitService
              //       .fetchVisitDetails(this.visitUuid)
              //       .subscribe((visitDetails) => {
              //         saveToStorage("visitNoteProvider", visitDetails.encounters[0]);
              //       });

              //     attributes.forEach((element) => {
              //       if (
              //         element.attributeType.uuid ===
              //         "ed1715f5-93e2-404e-b3c9-2a2d9600f062" &&
              //         !element.voided
              //       ) {
              //         const payload = {
              //           speciality: value.specialization,
              //           patient: {
              //             name: response.patient.display,
              //             provider: response.encounterProviders[0].display,
              //           },
              //           skipFlag: false,
              //         };
              //         this.pushNotificationService
              //           .postNotification(payload)
              //           .subscribe();
              //       }
              //     });
              //   }
              // });

            });
          }
        }
      })
  }

  getLang() {
    return localStorage.getItem("selectedLanguage");
   }
}
