import { Component, OnInit, Input } from "@angular/core";
import { PagerService } from '../../services/pager.service'

@Component({
  selector: "app-dashboard-table",
  templateUrl: "./dashboard-table.component.html",
  styleUrls: ["./dashboard-table.component.scss"],
})
export class DashboardTableComponent implements OnInit {
  @Input("tableConfig") set tableConfig(tableConfig) {
    this.table = tableConfig;
  }
  @Input() data;
  @Input() visitCounts;
  table: any;
  drSlots = [];
  allItems: any[];
  pager: any = {};
  pagedItems: any[];
  changeSide:boolean = false;

  constructor( private pagerService: PagerService) {}
 
  ngOnInit(){
    this.allItems = this.data
    this.setPage(1);    
  }

  setPage(page: number) {
    this.pager = this.pagerService.getPager(this.allItems.length, page);
    this.pagedItems = this.allItems.slice(this.pager.startIndex, this.pager.endIndex + 1);
  }

  onImgError(event: any) {
    event.target.src = 'assets/svgs/user.svg';
  }
  toggleCollapse(){
    this.changeSide = !this.changeSide;
  }
  get toggleImage() {
    return `assets/svgs/${
      this.changeSide ? "filter-table-up-arrow.svg" : "filter-table-down-arrow.svg"
    }`;
  }
}
