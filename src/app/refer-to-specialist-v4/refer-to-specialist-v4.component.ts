import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { FormGroup, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";

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
    private visitService: VisitService,
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
}
