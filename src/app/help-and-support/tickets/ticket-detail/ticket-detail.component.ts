import { Component } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';

import { PagerDutyDetail } from 'src/app/model/model';
import { PagerdutyService } from 'src/app/services/pagerduty.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-ticket-detail',
  templateUrl: './ticket-detail.component.html',
  styleUrls: ['./ticket-detail.component.scss']
})
export class TicketDetailComponent {
  ticketData: any;
  statuses = { 'triggered' : 'To Do', 'resolved': "Done", "acknowledged": "In Progress" };

  constructor(
    private translateService: TranslateService,
    private pagerdutyService: PagerdutyService,
    private pageTitleService: PageTitleService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    const id = this.activeRoute.snapshot.paramMap.get('id');
    this.pageTitleService.setTitle(null);
    this.getTicket(id);
  }
  
  /**
  * Get Ticket
  * @return {void}
  */
  getTicket(id: string): void{
    this.pagerdutyService.getTicket(id).subscribe((res:PagerDutyDetail)=>{
      this.ticketData = res?.incident;
    })
  }
}


