import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "../../environments/environment";
import * as moment from "moment";
import { DatePipe } from "@angular/common";

@Component({
  selector: 'app-visit-summary-readonly',
  templateUrl: './visit-summary-readonly.component.html',
  styleUrls: ['./visit-summary-readonly.component.scss'],
})
export class VisitSummaryReadonlyComponent implements OnInit {
  baseURL = environment.baseURL;
  image: string;
  patientInfo = [];
  patientIdentifier: string;
  info = {};
  age: any = {};
  now: any;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService,
    private datePipe: DatePipe
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
        } else if (attri.attributeType.display.match("occupation")) {
          this.info["occupation"] = attri.value;
        } else if (attri.attributeType.display.match("Health Scheme Card")) {
          this.info["medicalInsurance"] = attri.value;
        }
      });
      this.patientInfo.push(this.info);
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
