import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ExportAsConfig, ExportAsService } from "ngx-export-as";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { VisitService } from "src/app/services/visit.service";
// import { medicineProvidedAttrType } from "../homepage/tables/tables.component";

@Component({
  selector: "app-prescription",
  templateUrl: "./prescription.component.html",
  styleUrls: ["./prescription.component.css"],
})
export class PrescriptionComponent implements OnInit {
  exportAsConfig: ExportAsConfig = {
    type: "pdf",
    elementIdOrContent: "prescription",
  };
  private visitId;
  private openMrsId;
  date = new Date();
  exporting = false;
  data: any = {};
  attributes: any = {};
  drAttributesList: any;
  noPrescription = false;
  loading = true;
  medicineProvided = false;
  medications: any = [];
  diagnosis: any = [];
  testsAdvised: any = [];
  medicalAdvice: any = [];
  followupNeeded: any = [];
  notes: any = [];
  references: any = [];
  conceptReferPatient = "5f0d1049-4fd6-497e-88c4-ae13a34ae241";

  constructor(
    private route: ActivatedRoute,
    private exportAsService: ExportAsService,
    private diagnosisService: DiagnosisService,
    private visitService: VisitService
  ) {
    this.visitId = this.route.snapshot.paramMap.get("visitId");
    this.openMrsId = this.route.snapshot.paramMap.get("openMrsId");
  }

  ngOnInit(): void {
    this.getPrescriptionData();
    this.getVisitDetails();
  }

  getReferData() {
    this.diagnosisService
      .getObs(this.data.uuid, this.conceptReferPatient)
      .subscribe((response) => {
        response.results.forEach((obs) => {
          if (obs.encounter && obs.encounter.visit.uuid === this.visitId) {
            this.references.push(obs);
          }
        });
      });
  }

  getVisitDetails() {
    this.visitService
      .fetchVisitDetails(
        this.visitId,
        "custom:(attributes,patient:(uuid,person:(display)))"
      )
      .subscribe({
        next: (res: any) => {
          this.data.fullName = res?.patient?.person?.display;
          this.data.uuid = res?.patient?.uuid;
          this.getReferData();
          // if (res.attributes?.length) {
          //   if (res.attributes?.length > 0) {
          //     const medProvided = res.attributes.find(
          //       (a: any) => a?.attributeType?.uuid === medicineProvidedAttrType
          //     );
          //     this.medicineProvided = medProvided?.value || false;
          //   }
          // }
        },
      });
  }

  getPrescriptionData() {
    this.visitService
      .getVisitData({
        visitId: this.visitId,
        patientId: this.openMrsId,
      })
      .subscribe({
        next: (resp) => this.processData(resp),
        error: (err) => {
          console.log("err: ", err);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  processData(resp) {
    this.data = resp;
    console.log("this.data: ", this.data);
    try {
      if (this.data?.doctorAttributes?.split) {
        this.drAttributesList = this.data?.doctorAttributes?.split("|");
        this.drAttributesList.forEach((attr) => {
          const [key, val] = attr.split(":");
          this.attributes[key] = val;
        });
      }
      if (this.data?.medication?.split) {
        this.medications = this.data?.medication?.split(";").filter((i) => i);
      }
      if (this.data?.diagnosis?.split) {
        this.diagnosis = this.data?.diagnosis?.split(";").filter((i) => i);
      }
      if (this.data?.testsAdvised?.split) {
        this.testsAdvised = this.data?.testsAdvised
          ?.split(";")
          .filter((i) => i);
      }
      if (this.data?.medicalAdvice?.split) {
        this.medicalAdvice = this.data?.medicalAdvice
          ?.split(";")
          .filter((i) => i)
          .filter((i) => i !== " ");
      }
      if (this.data?.followupNeeded?.split) {
        this.followupNeeded = this.data?.followupNeeded
          ?.split(";")
          .filter((i) => i);
      }
      if (this.data?.notes?.split) {
        this.notes = this.data?.notes?.split(";").filter((i) => i);
      }
    } catch (error) {
      console.log("error: ", error);
    }
  }

  print() {
    window.print();
  }

  download() {
    this.exporting = true;
    setTimeout(() => {
      this.exportAsService
        .save(this.exportAsConfig, `e-prescription-${Date.now()}`)
        .subscribe({
          next: (res: any) => {
            this.exporting = false;
          },
        });
    }, 1000);
  }
}
