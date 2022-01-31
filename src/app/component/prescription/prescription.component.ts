import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute } from "@angular/router";
import { ExportAsConfig, ExportAsService } from "ngx-export-as";
import { DiagnosisService } from "src/app/services/diagnosis.service";
import { VisitService } from "src/app/services/visit.service";
import { environment } from "src/environments/environment";
import { EditMedicineComponent } from "./edit-medicine/edit-medicine.component";
declare var saveToStorage, deleteFromStorage;

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
  apisLoaded = {
    getReferData: false,
    getVisitDetails: false,
    getPrescriptionData: false,
  };
  conceptReferPatient = "5f0d1049-4fd6-497e-88c4-ae13a34ae241";
  medicineFilter;
  constructor(
    private route: ActivatedRoute,
    private exportAsService: ExportAsService,
    private diagnosisService: DiagnosisService,
    private visitService: VisitService,
    private dialog: MatDialog
  ) {
    this.visitId = this.route.snapshot.paramMap.get("visitId");
    this.openMrsId = this.route.snapshot.paramMap.get("openMrsId");
  }

  ngOnInit(): void {
    saveToStorage("session", environment.tempToken);
    this.getPrescriptionData();
    this.getVisitDetails();
  }

  checkAndRemoveTempToken(api) {
    if (!this.apisLoaded[api]) this.apisLoaded[api] = true;
    let allLoaded = true;
    for (const k in this.apisLoaded) {
      if (Object.prototype.hasOwnProperty.call(this.apisLoaded, k))
        if (!this.apisLoaded[k]) allLoaded = false;
    }
    if (allLoaded) deleteFromStorage("session");
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
        this.checkAndRemoveTempToken("getReferData");
      });
  }

  editMedicine() {
    this.dialog.open(EditMedicineComponent, {
      width: "600px",
      data: {
        medications: this.medications,
        visitId: this.visitId,
        medicineData: this.medicineFilter,
      },
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
          this.medicineFilter = res.attributes.filter(
            (a) =>
              a.attributeType.uuid === "bf6483f5-a73a-454a-b459-2d2cf3338330"
          );
          this.data.fullName = res?.patient?.person?.display;
          this.data.uuid = res?.patient?.uuid;
          this.getReferData();
          this.checkAndRemoveTempToken("getVisitDetails");
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
        complete: () => {
          this.loading = false;
          this.checkAndRemoveTempToken("getPrescriptionData");
        },
      });
  }

  processData(resp) {
    this.data = resp;
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

  get user() {
    try {
      return JSON.parse(localStorage.user);
    } catch (error) {
      return false;
    }
  }
}
