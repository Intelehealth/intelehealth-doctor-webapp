import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { AiIssueReportService } from 'src/app/services/ai-issue-report.service';
import { CoreService } from 'src/app/services/core/core.service';
import { getCacheData } from 'src/app/utils/utility-functions';
import { languages } from 'src/config/constant';

@Component({
  selector: 'app-ai-issue-reports',
  templateUrl: './ai-issue-reports.component.html',
  styleUrls: ['./ai-issue-reports.component.scss']
})
export class AiIssueReportsComponent implements OnInit {
  rows: any[] = [];
  total = 0;
  page = 1;
  pageSize = 20;
  loading = false;
  forbidden = false;
  status = '';
  aiSurface = '';
  statusOptions = ['open', 'reviewed', 'dismissed'];
  surfaceOptions = ['ddx', 'ddx_questions', 'ttx_medication', 'ttx_advice', 'ttx_test', 'ttx_referral', 'ttx_followup'];
  displayedColumns = ['createdAt', 'ai_surface', 'reason', 'suggestion_ref', 'details', 'status', 'visit_uuid', 'doctor_uuid'];

  constructor(
    private aiIssueReportService: AiIssueReportService,
    private pageTitleService: PageTitleService,
    private coreService: CoreService,
    private translateService: TranslateService,
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: 'AI Issue Reports', imgUrl: 'assets/svgs/alert-triangle.svg' });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.aiIssueReportService.list({
      status: this.status,
      ai_surface: this.aiSurface,
      page: this.page,
      pageSize: this.pageSize
    }).subscribe({
      next: (res: any) => {
        this.rows = res?.rows || [];
        this.total = res?.total || 0;
        this.forbidden = false;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.rows = [];
        this.total = 0;
        if (err?.status === 403) {
          this.forbidden = true;
          this.coreService.showToast('error', 'Admin access required to view AI issue reports.', 'Access denied', 'aiIssueReportsForbiddenToast');
        } else {
          this.coreService.showToast('error', 'Could not load AI issue reports.', 'Error', 'aiIssueReportsErrorToast');
        }
      }
    });
  }

  onPageChange(e: PageEvent): void {
    this.page = e.pageIndex + 1;
    this.pageSize = e.pageSize;
    this.load();
  }

  onFilterChange(): void {
    this.page = 1;
    this.load();
  }
}
