import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/services/auth.service";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { EncounterService } from "src/app/services/encounter.service";
import { VisitService } from "src/app/services/visit.service";
declare var getFromStorage: any,
  saveToStorage: any;

@Component({
  selector: "app-tabs-v4",
  templateUrl: "./tabs-v4.component.html",
  styleUrls: ["./tabs-v4.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TabsV4Component implements OnInit {
  visitNotePresent: boolean = false;
  show = false;
  patientUuid: string;
  visitUuid: string;
  setSpiner = true;
  constructor(private route: ActivatedRoute,
    private authService: AuthService,
    private visitService: VisitService,
    private diagnosisService: DiagnosisService,
    private encounterService: EncounterService) { }

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
}
