import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DiagnosisService } from 'src/app/services/diagnosis.service';
import { VisitService } from 'src/app/services/visit.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-prescription',
  templateUrl: './prescription.component.html',
  styleUrls: ['./prescription.component.css']
})
export class PrescriptionComponent implements OnInit {
  @Input() visitUUID;

  // exportAsConfig: ExportAsConfig = {
  //   type: "pdf",
  //   elementIdOrContent: "prescription",
  // };

  private patientId;
  // private openMrsId;
  date = new Date();
  // exporting = false;
  data: any = {};
  attributes: any = {};
  drAttributesList: any;
  // noPrescription = false;
  // loading = true;
  // medicineProvided = false;
  patientInfo = [];
  baseURL = environment.baseURL;
  images: any = [];
  additionalDocumentPresent = false;
  imageNameData = [];
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";
  complaints = [];
  examination = [];
  visitData = [];
  patientIdentifier: string;
  info = {};
  personAttributes = {};
  state: string;


  constructor(private route: ActivatedRoute,
    // private exportAsService: ExportAsService,
    private diagnosisService: DiagnosisService,
    private visitService: VisitService) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get("patientId");
    this.getAdditionalDocuments();
    this.getPatientDetails();
    this.getObsData();
  }

  getPatientDetails() {
    this.visitService.patientInfo(this.patientId).subscribe((info) => {
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
        // if (attri.attributeType.display.match("Son/wife/daughter")) {
        //   this.info["SWD"] = attri.value;
        // }
        if (attri.attributeType.display.match("Contact type")) {
          this.info["contactType"] = attri.value;
        }
        if (attri.attributeType.display.match("Husband Occupation")) {
          this.info["husbandOccupation"] = attri.value;
        }
        if (attri.attributeType.display?.startsWith("Income")) {
          this.info["income"] = attri.value;
        }
        if (attri.attributeType.display?.startsWith("Husband's Income")) {
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

  getObsData() {

    this.diagnosisService.getObsAll(this.patientId).subscribe((resp) => {
      var visitIds = [];
      (resp.results.forEach((c) => {
        if (visitIds.indexOf(c.encounter.visit.uuid) === -1) {
          visitIds.push(c.encounter.visit.uuid)
        }
      }))

      this.getDetails(visitIds, resp);
    })
  }

  async getDetails(visitIds: any[], resp: any) {
    for (const visitId of visitIds) {
      await this.visitService.fetchVisitDetails(visitId).subscribe((res) => {
        let qualification, specialization,registrationNumber;
        let providers = res?.encounters.find(({ display = "" }) => display.includes("ADULTINITIAL"))?.encounterProviders;
        providers[0].provider.attributes.forEach((attri) => {
          if (attri.attributeType.display.match("qualification")) {
             qualification = attri.value;
          }
          if (attri.attributeType.display.match("specialization")) {
             specialization = attri.value;
          }
          if (attri.attributeType.display.match("registrationNumber")) {
             registrationNumber = attri.value;
          }
        })
        let data = {
          examination: resp.results.filter((e) => e.encounter.visit.uuid == visitId && e.concept.uuid === "e1761e85-9b50-48ae-8c4d-e6b7eeeba084"),
          complaints: resp.results.filter((e) => e.encounter.visit.uuid == visitId && e.concept.uuid === "3edb0e09-9135-481e-b8f0-07a26fa9a5ce"),
          resolution:  resp.results.filter((e) => e.encounter.visit.uuid == visitId && e.concept.uuid === "dd24755d-4e7f-4175-b0d6-49f193c853c3"),
          providerName: providers[0].display,
          qual: qualification,
          specialization:specialization,
          regNo: registrationNumber,
          visitDate:res?.startDatetime
        };
        this.visitData.push(data);
      });
    }
  }

  getAdditionalDocuments() {
    // this.patientId = this.route.snapshot.paramMap.get("patientId");
    this.diagnosisService
      .getObs(this.patientId, this.conceptAdditionlDocument)
      .subscribe((response) => {
        response.results.forEach(async (obs) => {
          this.additionalDocumentPresent = true;
          const data1: any = await this.diagnosisService.getImageName(this.patientId, obs.uuid).toPromise();
          const data = {
            image: `${this.baseURL}/obs/${obs.uuid}/value`,
            imageName: data1.data[0].imageName
          };
          this.images.push(data);

        });
      });
  }

  print() {
    window.print();
  }

  // download() {
  //   this.exporting = true;
  //   setTimeout(() => {
  //     this.exportAsService
  //       .save(this.exportAsConfig, `e-prescription-${Date.now()}`)
  //       .subscribe({
  //         next: (res: any) => {
  //           this.exporting = false;
  //         },
  //       });
  //   }, 1000);
  // }
}
