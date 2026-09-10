import { Component, OnInit } from '@angular/core';
import { InsightService } from 'src/app/services/insight.service';
import { insightEvents } from 'src/config/insight-events';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.component.html',
  styleUrls: ['./insights.component.scss']
})
export class InsightsComponent implements OnInit {
  enabled = !!(environment as any).insightsEnabled;
  loading = true;
  rationaleOpens = 0;
  rationaleDoctors = 0;
  visitViews = 0;
  openRate = 0;
  recent: any[] = [];

  range = '24h';
  ranges = [
    { key: '24h', label: 'Last 24 hours' },
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: 'all', label: 'All time' }
  ];

  constructor(private insight: InsightService, private toastr: ToastrService) { }

  copy(text: string): void {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    this.toastr.success('Copied to clipboard');
  }

  short(id: string): string {
    if (!id) return '';
    return id.length > 10 ? `${id.slice(0, 4)}...${id.slice(-4)}` : id;
  }

  ngOnInit(): void {
    if (this.enabled) {
      this.load();
    } else {
      this.loading = false;
    }
  }

  private fromIso(): string | undefined {
    const hours: { [key: string]: number } = { '24h': 24, '7d': 24 * 7, '30d': 24 * 30 };
    if (!hours[this.range]) return undefined;
    return new Date(Date.now() - hours[this.range] * 3600 * 1000).toISOString();
  }

  load(): void {
    this.loading = true;
    const from = this.fromIso();
    this.insight.summary({ event_name: insightEvents.DDX_RATIONALE_OPENED, from, limit: 50 }).subscribe({
      next: (res: any) => {
        const d = res?.data || {};
        this.rationaleOpens = d.total || 0;
        this.rationaleDoctors = d.distinctActors || 0;
        this.recent = d.rows || [];
        this.computeRate();
      },
      error: () => { }
    });
    this.insight.summary({ event_name: insightEvents.VISIT_SUMMARY_VIEWED, from, limit: 1 }).subscribe({
      next: (res: any) => {
        const d = res?.data || {};
        this.visitViews = d.total || 0;
        this.computeRate();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  computeRate(): void {
    this.openRate = this.visitViews ? Math.round((this.rationaleOpens / this.visitViews) * 100) : 0;
  }
}
