import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { forkJoin } from "rxjs";
import { VisitEncounterPatientOrderService } from "src/app/services/visit-encounter-patient-order.service";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: "app-visit-external-facilities",
  templateUrl: "./visit-external-facilities.component.html",
  styleUrls: ["./visit-external-facilities.component.scss"],
})
export class VisitExternalFacilitiesComponent implements OnInit {
  medicalRequest: any[] = [];
  observationRequest: any[] = [];
  serviceRequest: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { mpiId: string },
    private visitEncounterService: VisitEncounterPatientOrderService,
    private dialogRef: MatDialogRef<VisitExternalFacilitiesComponent>
  ) {}

  ngOnInit(): void {
    this.fetchRequests();
  }

  /**
   * Closes the modal dialog
   * @param val - Boolean value indicating the dialog result
   */
  close(val: boolean): void {
    this.dialogRef.close(val);
  }

  /**
   * Fetch medical, observation, and service requests concurrently
   */
  private fetchRequests(): void {
    const { mpiId } = this.data;
    if (!mpiId) return;

    forkJoin({
      medical: this.visitEncounterService.getMiscellaneousRequest(
        "MedicationRequest",
        mpiId
      ),
      observation: this.visitEncounterService.getMiscellaneousRequest(
        "Observation",
        mpiId
      ),
      service: this.visitEncounterService.getMiscellaneousRequest(
        "ServiceRequest",
        mpiId
      ),
    }).subscribe(({ medical, observation, service }) => {
      this.medicalRequest = medical;
      this.observationRequest = observation;
      this.serviceRequest = service;
    });
  }

  generatePDF() {
    const documentDefinition: any = {
      content: [
        { text: "External Facilities", style: "title" },

        // Visit History Section
        { text: "Visit History", style: "sectionTitle" },
        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 },
          ],
        },
        this.observationRequest.length
          ? (this.observationRequest as any).flatMap((section) => [
              { text: section.title, style: "subHeader" },
              {
                ul: section.data.flatMap((item, itemIndex, arr) => {
                  const itemContent = Array.isArray(item)
                    ? item.map((subItem) => ({
                        text: subItem,
                        style: "listItem",
                      }))
                    : [{ text: item, style: "listItem" }];

                  return [
                    { ul: itemContent },
                    itemIndex < arr.length - 1
                      ? {
                          text: "________________________________________",
                          alignment: "center",
                          margin: [0, 5],
                        }
                      : null, // Separator after each item except the last
                  ].filter(Boolean); // Remove null values
                }),
              },
            ])
          : { text: "No medical history available", style: "noData" },

        // Medication History Section
        { text: "Medication History", style: "sectionTitle" },
        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 },
          ],
        },
        this.medicalRequest.length
          ? {
              table: {
                headerRows: 1,
                widths: ["30%", "20%", "20%", "30%"],
                body: [
                  [
                    { text: "Medication Name", style: "tableHeader" },
                    { text: "Dosage", style: "tableHeader" },
                    { text: "Days", style: "tableHeader" },
                    { text: "Doctor Name", style: "tableHeader" },
                  ],
                  ...this.medicalRequest.map((item) => [
                    { text: item.medicationName, style: "tableCell" },
                    { text: item.dosage, style: "tableCell" },
                    { text: item.days, style: "tableCell" },
                    { text: item.doctorName, style: "tableCell" },
                  ]),
                ],
              },
              layout: {
                fillColor: (rowIndex) => (rowIndex === 0 ? "#eeeeee" : null),
              },
            }
          : { text: "No medication history available", style: "noData" },

        // Test History Section
        { text: "Test History", style: "sectionTitle" },
        {
          canvas: [
            { type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 },
          ],
        },
        this.serviceRequest.length
          ? {
              table: {
                headerRows: 1,
                widths: ["40%", "30%", "30%"],
                body: [
                  [
                    { text: "Doctor Name", style: "tableHeader" },
                    { text: "Test Name", style: "tableHeader" },
                    { text: "Given Date", style: "tableHeader" },
                  ],
                  ...this.serviceRequest.map((item) => [
                    { text: item.doctorName, style: "tableCell" },
                    { text: item.testName, style: "tableCell" },
                    { text: item.testGivenDate, style: "tableCell" },
                  ]),
                ],
              },
              layout: {
                fillColor: (rowIndex) => (rowIndex === 0 ? "#eeeeee" : null),
              },
            }
          : { text: "No test history available", style: "noData" },
      ],
      styles: {
        title: {
          fontSize: 22,
          bold: true,
          color: "#2E3A59",
          alignment: "center",
          margin: [0, 0, 0, 15],
        },
        sectionTitle: {
          fontSize: 18,
          bold: true,
          color: "#1E83E5",
          margin: [0, 15, 0, 5], // Adjusted margin to make space for the line
        },
        subHeader: {
          fontSize: 16,
          bold: true,
          margin: [0, 5, 0, 3],
          color: "#37474F",
        },
        listItem: {
          fontSize: 12,
          margin: [5, 2, 0, 2],
        },
        noData: {
          fontSize: 12,
          italics: true,
          color: "gray",
          margin: [0, 5, 0, 5],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "#37474F",
          fillColor: "#f9f9f9",
          alignment: "center",
          margin: [4, 4, 4, 4],
        },
        tableCell: {
          fontSize: 12,
          margin: [4, 2, 4, 2],
        },
      },
    };

    // Generate and download the PDF
    pdfMake
      .createPdf(documentDefinition)
      .download("External_Facilities_Report.pdf");
  }
}
