import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { FormGroup, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { ConfirmDialogService } from "../component/visit-summary/reassign-speciality/confirm-dialog/confirm-dialog.service";
import { EncounterService } from "../services/encounter.service";
declare var getFromStorage:any, saveToStorage:any;
@Component({
  selector: "app-refer-to-specialist-v4",
  templateUrl: "./refer-to-specialist-v4.component.html",
  styleUrls: ["./refer-to-specialist-v4.component.scss"],
})
export class ReferToSpecialistV4Component implements OnInit {
  type = "N";
  patientDetails: any;
  visitUuid = this.route.snapshot.paramMap.get("visit_id");


  baseURL = environment.baseURL;
  baseURLProvider = `${this.baseURL}/visit/${this.visitUuid}/attribute`;
  selected: any;
  specaiList = [
    "General Physician",
    "Dermatologist",
    "Physiotherapist",
    "Gynecologist",
    "Pediatrician",
  ];

  updateSpeciality = new FormGroup({
    specialization: new FormControl(""),
  });

  referToSpecailist = {
    data: ["Refer to another speciality", "Specialization"],
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private visitService: VisitService,
    private dialogService: ConfirmDialogService,
    private encounterService: EncounterService
  ) {}

  ngOnInit(): void {
    this.selected = this.specaiList[0];
    this.visitService.getVisit(this.visitUuid).subscribe((visitDetails) => {
      this.patientDetails = visitDetails;
      this.updateSpeciality.controls.specialization.setValue(
        this.patientDetails.attributes[0].value
      );
    });
  }
  Submit() {
    this.dialogService
      .openConfirmDialog(
        "Are you sure to re-assign this visit to another doctor?"
      )
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          if (this.selected !== null) {
            const json = {
              attributeType: "3f296939-c6d3-4d2e-b8ca-d7f4bfd42c2d",
              value: this.selected
            };
            if(this.patientDetails.attributes[0].display) {
              this.visitService.updateAttribute(this.visitUuid,this.patientDetails.attributes[0].uuid,json)
              .subscribe(() => {
                this.updateEncounter();
              });
            } else {
              this.visitService.postAttribute(this.visitUuid,json)
              .subscribe(() => {
                this.updateEncounter();
              });
            }
          }
        }
      });
    }

  private updateEncounter() {
    this.router.navigate(["/dashboard"]);
    const myDate = new Date(Date.now() - 30000);
    const patientUuid = this.route.snapshot.paramMap.get("patient_id");
    const providerDetails = getFromStorage("provider");
    const providerUuid = providerDetails.uuid;
    const json = {
      patient: patientUuid,
      encounterType: "8d5b27bc-c2cc-11de-8d13-0010c6dffd0f",
      encounterProviders: [
        {
          provider: providerUuid,
          encounterRole: "73bbb069-9781-4afc-a9d1-54b6b2270e04",
        },
      ],
      visit: this.visitUuid,
      encounterDatetime: myDate,
    };
    this.encounterService.postEncounter(json).subscribe(
      (response) => {
        if (response) {
          this.visitService
            .fetchVisitDetails(this.visitUuid)
            .subscribe((visitDetails) => {
              saveToStorage(
                "visitNoteProvider",
                visitDetails.encounters[0]
              );
            });
        }
      }
    );
  }
}
