import { Component, OnInit } from '@angular/core';
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

  baseURL = environment.baseURL;
  images: any = [];
  additionalDocumentPresent = false;
  imageNameData = [];
  conceptAdditionlDocument = "07a816ce-ffc0-49b9-ad92-a1bf9bf5e2ba";

  patientIdentifier: string;
  info = {};
  personAttributes = {};
  state: string;


  constructor( private route: ActivatedRoute,
    // private exportAsService: ExportAsService,
    private diagnosisService: DiagnosisService,
    private visitService: VisitService) { }

  ngOnInit(): void {
    
    this.patientId= this.route.snapshot.paramMap.get("patientId");
    // this.getPrescriptionData();
    // this.getVisitDetails();
    this.getAdditionalDocuments();
    this.getPatientDetails();
  }
  
  getPatientDetails(){
    this.visitService.patientInfo(this.patientId).subscribe((info) => {
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
    });
  }
  
  
  getAdditionalDocuments(){
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

  // getPrescriptionData() {
  //   this.visitService
  //     .getVisitData({
  //       // visitId: this.visitId,
  //       patientId: this.patientId,
  //     })
  //     .subscribe({
  //       next: (resp) => this.processData({resp}),
  //       error: (err) => {
  //         console.log("err: ", err);
  //       },
  //       complete: () => {
  //         // this.loading = false;
  //       },
  //     });
  // }

  // medications: any = [];
  // diagnosis: any = [];
  // testsAdvised: any = [];
  // medicalAdvice: any = [];
  // followupNeeded: any = [];
  // notes: any = [];

  // processData(resp) {
  //   console.log('resp: ', resp);
  //   this.data = resp;
  //   console.log('this.data: ', this.data);
  //   try {
  //     if (this.data?.doctorAttributes?.split) {
  //       this.drAttributesList = this.data?.doctorAttributes?.split("|");
  //       this.drAttributesList.forEach((attr) => {
  //         const [key, val] = attr.split(":");
  //         this.attributes[key] = val;
  //       });
  //     }
  //     if (this.data?.medication?.split) {
  //       this.medications = this.data?.medication?.split(";").filter((i) => i);
  //     }
  //     if (this.data?.diagnosis?.split) {
  //       this.diagnosis = this.data?.diagnosis?.split(";").filter((i) => i);
  //     }
  //     if (this.data?.testsAdvised?.split) {
  //       this.testsAdvised = this.data?.testsAdvised
  //         ?.split(";")
  //         .filter((i) => i);
  //     }
  //     if (this.data?.medicalAdvice?.split) {
  //       this.medicalAdvice = this.data?.medicalAdvice
  //         ?.split(";")
  //         .filter((i) => i)
  //         .filter((i) => i !== " ");
  //     }
  //     if (this.data?.followupNeeded?.split) {
  //       this.followupNeeded = this.data?.followupNeeded
  //         ?.split(";")
  //         .filter((i) => i);
  //     }
  //     if (this.data?.notes?.split) {
  //       this.notes = this.data?.notes?.split(";").filter((i) => i);
  //     }
  //   } catch (error) {
  //     console.log("error: ", error);
  //   }
  // }
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
