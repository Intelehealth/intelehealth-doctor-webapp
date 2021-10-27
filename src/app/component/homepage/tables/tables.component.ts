import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTable } from "@angular/material/table";
import { MatTableDataSource } from "@angular/material/table";
import { HelperService } from "src/app/services/helper.service";
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
  dataSource;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @Input() data;
  @Input() dataFor;
  constructor(private helper: HelperService) {}

  ngOnInit() {
    this.setPrescription();
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.helper.refreshTable.subscribe(() => {
      this.refresh();
    });
  }

  setPrescription() {
    if (this.dataFor === "completedVisit") {
      this.displayColumns.push("prescription");
      this.data.forEach((e) => {
        e.prescription = `#/prescription/${e.visitId}/${e.id}`;
      });
    }
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
