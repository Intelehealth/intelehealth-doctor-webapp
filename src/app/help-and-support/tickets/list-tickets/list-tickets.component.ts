import { Component, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { PagerdutyList } from 'src/app/model/model';
import { CoreService } from 'src/app/services/core/core.service';
import { PagerdutyService } from 'src/app/services/pagerduty.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-list-tickets',
  templateUrl: './list-tickets.component.html',
  styleUrls: ['./list-tickets.component.scss']
})
export class ListTicketsComponent {
  displayedColumns : string[] = ['id', 'title', 'createdAt', 'updatedAt', 'priority', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>();
  @ViewChild('ticketPaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  ticketData: any;
  totalData: number;
  pageIndex: number = 0;
  pageSize: number = 5;
  openTicketsCount: number = 0;
  statuses = { 'triggered' : 'To Do', 'resolved': "Done", "acknowledged": "In Progress" };

  constructor(
    private translateService: TranslateService,
    private pagerdutyService: PagerdutyService,
    private modalService: CoreService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
  }

  
  // getTickets(): void {
  //   this.paginator.page
  //     .pipe(
  //       startWith({}),
  //       switchMap(() => {
  //         return this.getTableData(
  //           this.paginator.pageIndex + 1,
  //           this.paginator.pageSize
  //         ).pipe(catchError(() => observableOf(null)));
  //       }),
  //       map((ticketData:any) => {
  //         if (ticketData == null) return [];
  //         this.totalData = ticketData.total;
  //         console.log(ticketData);
  //         return ticketData.data;
  //       })
  //     )
  //     .subscribe((ticketData) => {
  //       this.ticketData = ticketData;
  //       this.dataSource = new MatTableDataSource(this.ticketData);
  //     });
  // }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.getAllTickets();
  }

  /**
  * Get Tickets
  * @return {void}
  */
  getAllTickets(): void{
    this.pagerdutyService.getAllTickets(this.pageIndex+1, this.pageSize).subscribe((res:PagerdutyList)=>{
      this.ticketData = res.tickets;
      this.dataSource = new MatTableDataSource(this.ticketData);
      this.pageIndex = res.currentPage - 1;
      this.totalData = res.totalItems;
      this.openTicketsCount = res.openItems ? res.openItems : 0;
    })
  }

  getTableData(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getAllTickets();
  }

  createTicket(){
    this.modalService.openAddTicketModal().subscribe((result) => {
      if(result){
        this.getAllTickets();
        this.toastr.success('Ticket has been raised successfully!', 'Ticket raised');      
      }
    });
  }
}


