import { Component, OnInit } from "@angular/core";
import { ImagesService } from "src/app/services/images.service";
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
  info: any = {};
  profileImagePresent = false;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private service: ImagesService
  ) {}

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.service.fetchProfileImage(uuid).subscribe((response) => {
      this.profileImagePresent = true;
      this.image = `${this.baseURL}/personimage/${uuid}`;
    });
    this.visitService.patientInfo(uuid).subscribe((info) => {
      this.info = info.person;
      console.log('this.info: ', this.info);
      localStorage.setItem("patientName", this.info["display"]);

      this.patientIdentifier = info.identifiers[0].identifier;
      this.info["attributes"].forEach((attri) => {
        if (attri.attributeType.display.match("Telephone Number")) {
          this.info["telephone"] = attri.value;
        } else if (attri.attributeType.display.match("occupation")) {
          this.info["occupation"] = attri.value;
        } else if (attri.attributeType.display.includes("Health District")) {
          this.info.district = attri.value;
        }
      });
      this.patientInfo.push(this.info);
    });
  }
}
