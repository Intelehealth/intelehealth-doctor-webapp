import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { HelperService } from "src/app/services/helper.service";
import { VisitService } from "src/app/services/visit.service";

@Component({
  selector: "app-tables",
  templateUrl: "./tables.component.html",
  styleUrls: ["./tables.component.css"],
})
export class TablesComponent implements OnInit {
  displayColumns: string[] = [
    "id",
    "name",
    "telephone",
    "gender",
    "age",
    "location",
    // "status",
    "provider",
    "lastSeen",
  ];
  dataSource;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @Input() data;
  @Input() tableFor;
  @Input() visitCounts;
  @Output() tableEmitter = new EventEmitter();
  @Output() emptyRow = new EventEmitter();
  @Input() set allVisitsLoaded(val) {
    this.dataLoaded = val;
    if (this.dataLoaded) {
      this.refresh();
    }
  }
  dataLoaded = false;
  loadedDataLength: Number = 0;

  constructor(private service: VisitService, private helper: HelperService) {}

  ngOnInit() {
    this.loadedDataLength = Number(`${this.data.length}`);
    this.data.length = this.visitCounts;
    if(this.tableFor === "followUpVisit") {
      this.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    this.dataSource = new MatTableDataSource([...this.data]);
    this.dataSource.paginator = this.paginator;
    if(this.tableFor !== "followUpVisit") {
    this.sort.sort(({ id: 'lastSeen', start: 'desc'}) as MatSortable);
    this.dataSource.sort = this.sort;
    }
    if (this.tableFor === "completedVisit") {
      this.displayColumns.splice(6,0,"healthWorker");
      this.displayColumns.splice(7,0,"diagnosis");
    }
    if(this.tableFor === "followUpVisit") {
      this.displayColumns.splice(6,0,"diagnosis");
      this.displayColumns.push("date");
      this.sort.sort(({}) as MatSortable);
      this.dataSource.sort = this.sort;
    }
    this.helper.refreshTable.subscribe(() => {
      this.refresh();
    });
  }

  /**
   * Apply filter with the filter string
   * @param filterValue String
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  refresh() {
    const newData = this.service[this.tableFor];
    let data = [];
    newData.forEach((item) => {
      data = this.helper.getUpdatedValue(data, item, "id");
    });
    this.loadedDataLength = Number(`${data.length}`);
    data.length = this.visitCounts;
    if (data && Array.isArray(data)) {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.table.renderRows();
    }
  }

  hasEmptyRow() {
    if (!this.dataLoaded) {
      this.emptyRow.emit();
    }
  }

  changePage({ length, pageIndex, pageSize }) {
    const data: any = {
      loadMore: this.loadedDataLength === length ? false : true,
      // loadMore: (pageIndex + 1) * pageSize >= length,
      refresh: this.refresh.bind(this),
    };
    this.tableEmitter.emit(data);
  }
}
