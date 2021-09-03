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
  patientInfo = [];
  patientIdentifier: string;
  info = {};
  personAttributes = {};
  state: string;

  constructor(
    private route: ActivatedRoute,
    private visitService: VisitService) {}

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get("patient_id");
    this.visitService.patientInfo(uuid).subscribe((info) => {
      console.log('info: ', info);
      this.info = info.person;
      this.state = info.person.preferredAddress.stateProvince
      this.patientIdentifier = info.identifiers[0].identifier;
      this.info["attributes"].forEach((attri) => {
        if (attri.attributeType.display.match("Telephone Number")) {
          this.info["telephone"] = attri.value;
        } 
        if (attri.attributeType.display.match("Caste")) {
          this.info["Caste"] = attri.value;
        } 
        if (attri.attributeType.display.match("occupation")) {
          this.info["occupation"] = attri.value;
        } 
        if (attri.attributeType.display.match("Landmark")) {
          this.info["Landmark"] = attri.value;
        } 
        if (attri.attributeType.display.match("Survivor marriage type")) {
          this.info["Survivor_marriage_type"] = attri.value;
        } 
        if (attri.attributeType.display.match("Marriage age")) {
          this.info["Marriage_age"] = attri.value;
        } 
        if (attri.attributeType.display.match("Education")) {
          this.info["Education"] = attri.value;
        }
        if (attri.attributeType.display.match("Telephone number for survivor")) {
          this.info["Telephone_number_for_survivor"] = attri.value;
        }
        if (attri.attributeType.display.match("Case reffered by")) {
          this.info["caseRefferedBy"] = attri.value;
        }
        if (attri.attributeType.display.match("Am speaking with survivor")) {
          this.info["amSpeakingWithSurvivor"] = attri.value;
        }
        if (attri.attributeType.display.match("Son/wife/daughter")) {
          this.info["SWD"] = attri.value;
        }
        if (attri.attributeType.display.match("Contact type")) {
          this.info["contactType"] = attri.value;
        }
        if (attri.attributeType.display.match("Husband Occupation")) {
          this.info["husbandOccupation"] = attri.value;
        }
        if (attri.attributeType.display.match("Income")) {
          this.info["income"] = attri.value;
        }
        if (attri.attributeType.display.match("Husband's Income")) {
          this.info["husbandIncome"] = attri.value;
        }
        if (attri.attributeType.display.match("Survivor maritual status")) {
          this.info["Survivor_maritual_status"] = attri.value;
        }
        if (attri.attributeType.display.match("Children Status")) {
          this.info["Children_Status"] = attri.value;
        }
        if (attri.attributeType.display.match("Maternal home address")) {
          this.info["Maternal_home_address"] = attri.value;
        }
        if (attri.attributeType.display.match("Maternal phone number")) {
          this.info["Maternal_phone_number"] = attri.value;
        }
        if (attri.attributeType.display.match("Address of in-laws")) {
          this.info["Address_of_in_laws"] = attri.value;
        }
        if (attri.attributeType.display.match("Emergency Phone Number")) {
          this.info["Emergency_Phone_Number"] = attri.value;
        }
        if (attri.attributeType.display.match("No. of Childrens")) {
          this.info["No_of_Childrens"] = attri.value;
        }
        if (attri.attributeType.display.match("Survivor living with")) {
          this.info["Survivor_living_with"] = attri.value;
        }
        if (attri.attributeType.display.match("Maritual Status")) {
          this.info["maritualStatus"] = attri.value;
        }
      })
      this.patientInfo.push(this.info);
    });
  }
}
