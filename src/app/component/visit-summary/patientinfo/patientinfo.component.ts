import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "../../../../environments/environment";
import { DatePipe } from "@angular/common";

@Component({
  selector: "app-patientinfo",
  templateUrl: "./patientinfo.component.html",
  styleUrls: ["./patientinfo.component.css"],
  providers: [DatePipe],
})
export class PatientinfoComponent implements OnInit {
  baseURL = environment.baseURL;
  image: string;
  patientInfo = [];
  patientIdentifier: string;
  info = {};
  state: string;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService ) {}

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitService.patientInfo(uuid).subscribe((info) => {
      this.info = info.person;
      this.state = info.person.preferredAddress.stateProvince
      this.patientIdentifier = info.identifiers[0].identifier;
      this.info["attributes"].forEach((attri) => {
        if (attri.attributeType.display.match("Telephone Number")) {
          this.info["telephone"] = attri.value;
        } 
      });
      this.patientInfo.push(this.info);
    });
  }
}
