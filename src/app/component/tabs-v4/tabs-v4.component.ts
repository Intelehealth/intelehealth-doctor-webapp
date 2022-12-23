import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
declare var saveToStorage: any;

@Component({
  selector: "app-tabs-v4",
  templateUrl: "./tabs-v4.component.html",
  styleUrls: ["./tabs-v4.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class TabsV4Component implements OnInit {
  visitNotePresent:boolean=false;
  show = false;
  constructor( private route: ActivatedRoute, private visitService: VisitService) {}

  ngOnInit(): void {
    let patientUuid = this.route.snapshot.paramMap.get("patient_id");
    let visitUuid = this.route.snapshot.paramMap.get("visit_id");
    this.visitService
      .fetchVisitDetails(visitUuid)
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
  }
