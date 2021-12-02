import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "../../../../environments/environment";
import { DatePipe } from "@angular/common";
import { ValueConverter } from "@angular/compiler/src/render3/view/template";

@Component({
  selector: "app-patientinfo",
  templateUrl: "./patientinfo.component.html",
  styleUrls: ["./patientinfo.component.css"],
  providers: [DatePipe],
})
export class PatientinfoComponent implements OnInit {
  baseURL = environment.baseURL;
  patientInfo = [];
  patientIdentifier: string;
  info = {};
  personAttributes = {};
  state: string;
  gender: string;
  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService) { }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitService.patientInfo(uuid).subscribe((info) => {
      this.info = info.person;
      this.gender = this.getPatientInfo(this.info['gender']);
      this.state = info.person.preferredAddress.stateProvince
      this.patientIdentifier = info.identifiers[0].identifier;
      this.info["attributes"].forEach((attri) => {
        if (attri.attributeType.display.match("Telephone Number")) {
          this.info["telephone"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Caste")) {
          this.info["Caste"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("occupation")) {
          this.info["occupation"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Landmark")) {
          this.info["Landmark"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Survivor marriage type")) {
          this.info["Survivor_marriage_type"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Marriage age")) {
          this.info["Marriage_age"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Education")) {
          this.info["Education"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Telephone number for survivor")) {
          this.info["Telephone_number_for_survivor"] = attri.value;
        }
        if (attri.attributeType.display.match("Case reffered by")) {
          this.info["caseRefferedBy"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Am speaking with survivor")) {
          this.info["amSpeakingWithSurvivor"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Son/wife/daughter")) {
          this.info["SWD"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Contact type")) {
          this.info["contactType"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Husband Occupation")) {
          this.info["husbandOccupation"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display?.startsWith("Income")) {
          this.info["income"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display?.startsWith("Husband's Income")) {
          this.info["husbandIncome"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Survivor maritual status")) {
          this.info["Survivor_maritual_status"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Children Status")) {
          this.info["Children_Status"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Maternal home address")) {
          this.info["Maternal_home_address"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Maternal phone number")) {
          this.info["Maternal_phone_number"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Address of in-laws")) {
          this.info["Address_of_in_laws"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Emergency Phone Number")) {
          this.info["Emergency_Phone_Number"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("No. of Childrens")) {
          this.info["No_of_Childrens"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Survivor living with")) {
          this.info["Survivor_living_with"] = this.getPatientInfo(attri.value);
        }
        if (attri.attributeType.display.match("Maritual Status")) {
          this.info["maritualStatus"] = this.getPatientInfo(attri.value);
        }
      })
      this.patientInfo.push(this.info);
    });
  }


  getPatientInfo(attriValue) {
    let value;
    if (attriValue.toString().startsWith("{")) {
      let value1 = JSON.parse(attriValue.toString());
      value = value1["en"];
    } else {
      value = attriValue
    }
    return value;
  }
}
