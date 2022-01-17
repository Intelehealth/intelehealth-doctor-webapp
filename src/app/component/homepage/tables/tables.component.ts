import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { MatTableDataSource } from "@angular/material/table";
import { EncounterService } from "src/app/services/encounter.service";
import { HelperService } from "src/app/services/helper.service";
import { VisitService } from "src/app/services/visit.service";

export const medicineProvidedAttrType = "1751add0-836b-4163-a153-add19f6bda1a";
@Component({
  selector: "app-tables",
  templateUrl: "./tables.component.html",
  styleUrls: ["./tables.component.css"],
})
export class TablesComponent implements OnInit {
  displayColumns: string[] = [
    "id",
    "name",
    "gender",
    "age",
    "state",
    "village",
    "status",
    "provider",
    "lastSeen",
  ];
  medicineProvidedAttrType = medicineProvidedAttrType;
  dataSource;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @Input() data;
  @Input() dataFor;
  @Input() visits;
  constructor(
    private helper: HelperService,
    private visitService: VisitService,
    private encounterService: EncounterService
  ) {}

  ngOnInit() {
    this.setPrescription();
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.helper.refreshTable.subscribe(() => {
      this.setPrescription();
      this.setVitals();
      this.refresh();
    });
  }

  setPrescription() {
    if (this.dataFor === "completedVisit") {
      this.displayColumns.push("prescription");
      // this.displayColumns.push("medicineProvided");
      this.displayColumns = [...new Set(this.displayColumns)];
      this.data.forEach((e) => {
        e.prescription = `#/prescription/${e.visitId}/${e.id}`;
        // if (e.attributes?.length > 0) {
        //   e.medicineProvided = e.attributes.find(
        //     (a: any) => a?.attributeType?.uuid === this.medicineProvidedAttrType
        //   );
        // }
      });
    }
  }

  setVitals() {
    if (this.dataFor === "flagVisit" || this.dataFor === "waitingVisit") {
      this.displayColumns.push("vitals");
      this.displayColumns = [...new Set(this.displayColumns)];
      this.data.forEach((e) => {
        if(e.encounteruuid) {
        this.encounterService.vitals(e.encounteruuid).subscribe((vitals) => {
          const vital = vitals.obs;         
          const bloodGroup = vital.filter(a=>a.concept.name.display === 'Blood Group' && a.value)
          const SugarLF = vital.filter(a=>a.concept.name.display === 'Sugar Level - Fasting' && a.value)
          const SugarAM = vital.filter(a=>a.concept.name.display === 'Sugar Level - After Meal' && a.value)
          const hemoglobin = vital.filter(a=>a.concept.name.display === 'HGB' && a.value)

          if(bloodGroup.length >0 && SugarLF.length >0 && SugarAM.length >0 && hemoglobin.length > 0){
            e.isVitalPresent = true
          }else{
            e.isVitalPresent =false;
          }
          // (bloodGroup && SugarLF && SugarAM && hemoglobin) ? e.isVitalPresent = true : e.isVitalPresent =false; 
        });
      } else {
        e.isVitalPresent = false;
      }
      });
    }
  }

  setMedicineProvided(row: any, value: Boolean) {
    this.visitService
      .setVisitAttribute(
        row?.visitId,
        {
          attributeType: this.medicineProvidedAttrType,
          value,
        },
        row?.medicineProvided
      )
      .subscribe((res: any) => {
        if (!row?.medicineProvided) {
          row.medicineProvided = res;
          let visit = this.visits.find((v) => v.visitId === row.visitId);
          visit.medicineProvided = res;
          let dataVisit = this.data.find((v) => v.visitId === row.visitId);
          dataVisit.medicineProvided = res;
        } else {
          this.data.find(
            (v) => v.visitId === row.visitId
          ).medicineProvided.value = value;
          this.data.find(
            (v) => v.visitId === row.visitId
          ).medicineProvided.value = value;
        }
        this.refresh();
      });
  }

  refresh() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.table.renderRows();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  redirect(link) {
    window.open(link, "_blank");
  }
}
