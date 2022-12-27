import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "../../../environments/environment";
import * as moment from "moment";
import { DatePipe } from "@angular/common";
import { ProfileService } from "src/app/services/profile.service";

@Component({
  selector: "app-patient-details",
  templateUrl: "./patient-details.component.html",
  styleUrls: ["./patient-details.component.scss"],
})
export class PatientDetailsComponent implements OnInit {
  baseURL = environment.baseURL;
  image: string;
  patientInfo = [];
  patientIdentifier: string;
  info = {};
  age: any = {};
  now: any;
  whatsappLink: string;
  personImageURL = 'assets/svgs/v-profile.svg';

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private datePipe: DatePipe,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitService.patientInfo(uuid).subscribe((info) => {
      this.info = info.person;
      localStorage.setItem("patientName", this.info["display"]);

      this.patientIdentifier = info.identifiers[0].identifier;
      this.info["attributes"].forEach((attri) => {
        if (attri.attributeType.display.match("Telephone Number")) {
          this.info["telephone"] = attri.value;
          this.whatsappLink = this.visitService.getWhatsappLink(this.info["telephone"],`Hello I'm calling for consultation`);
        } else if (attri.attributeType.display.match("occupation")) {
          this.info["occupation"] = attri.value;
        } else if (attri.attributeType.display.match("Health Scheme Card")) {
          this.info["medicalInsurance"] = attri.value;
        }
      });
      this.patientInfo.push(this.info);
    });
    this.profileService.getProfileImage(uuid).subscribe((response) => {
      this.personImageURL = `${this.profileService.baseURL}/personimage/${uuid}`;
    }, (err) => {
      this.personImageURL = this.personImageURL;
    });
  }

  getAge(dateString) {
    var mydate = dateString.replace(
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      "$3, $2, $1"
    );
    this.now = new Date();
    var todayDate = this.datePipe.transform(this.now, "yyyy, MM, dd");
    var a = moment(todayDate);
    var b = moment(mydate);
    var diffDuration = moment.duration(a.diff(b));
    var ageString =
      diffDuration.years() +
      " years - " +
      diffDuration.months() +
      " months - " +
      diffDuration.days() +
      " days";
    return ageString;
  }
}
