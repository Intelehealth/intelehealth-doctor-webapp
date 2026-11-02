import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { PageEvent } from "@angular/material/paginator";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { interval, Subject, Subscription } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { PageTitleService } from "src/app/core/page-title/page-title.service";
import { VoicedocService, VoicedocTranscriptItem } from "src/app/services/voicedoc.service";
import { getCacheData } from "src/app/utils/utility-functions";
import { formatDuration, VoiceTranscriptSource, VOICE_TRANSCRIPT_SOURCE_LABELS } from "src/app/utils/voice-transcript";
import { languages } from "src/config/constant";
import { VoiceTranscriptDetailComponent } from "./voice-transcript-detail/voice-transcript-detail.component";

export const VOICE_TRANSCRIPT_POLL_MS = 10000;

export type VoiceTranscriptLoadState = "ok" | "forbidden" | "error";

@Component({
  selector: "app-voice-transcripts",
  templateUrl: "./voice-transcripts.component.html",
  styleUrls: ["./voice-transcripts.component.scss"]
})
export class VoiceTranscriptsComponent implements OnInit, OnDestroy {
  displayedColumns: string[] = ["startedAt", "patient", "visit", "doctor", "chw", "source", "duration", "chunks", "status", "actions"];
  sourceOptions: { value: VoiceTranscriptSource | ""; label: string }[] = [
    { value: "", label: "All" },
    { value: "webapp", label: "Web" },
    { value: "mobile", label: VOICE_TRANSCRIPT_SOURCE_LABELS.mobile }
  ];
  sourceLabels: { [key: string]: string } = VOICE_TRANSCRIPT_SOURCE_LABELS;
  items: VoicedocTranscriptItem[] = [];
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  source: VoiceTranscriptSource | "" = "";
  loading = false;
  state: VoiceTranscriptLoadState = "ok";

  private listSub: Subscription;
  private refreshSub: Subscription;
  private pollSub: Subscription;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private voicedocService: VoicedocService,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.translateService.use(getCacheData(false, languages.SELECTED_LANGUAGE));
    this.pageTitleService.setTitle({ title: "Admin Actions", imgUrl: "assets/svgs/admin-actions.svg" });
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const source = params.get("source");
      this.source = source === "webapp" || source === "mobile" ? source : "";
      this.pageIndex = 0;
      this.loadTranscripts();
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.listSub?.unsubscribe();
    this.refreshSub?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  get hasPending(): boolean {
    return this.items.some(item => item.status === "recording" || item.status === "finalizing");
  }

  private get fetching(): boolean {
    return this.loading || (!!this.refreshSub && !this.refreshSub.closed);
  }

  private startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = interval(VOICE_TRANSCRIPT_POLL_MS).pipe(
      filter(() => !this.fetching),
      takeUntil(this.destroy$)
    ).subscribe(() => this.refresh());
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  private evaluatePolling(): void {
    if (this.hasPending) {
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  refresh(): void {
    if (this.loading) return;
    this.refreshSub?.unsubscribe();
    this.refreshSub = this.voicedocService.listTranscripts(this.pageIndex + 1, this.pageSize, this.source || undefined).subscribe({
      next: res => {
        this.items = res?.data?.items ?? [];
        this.total = res?.data?.total ?? 0;
        this.state = "ok";
        this.evaluatePolling();
      },
      error: () => { }
    });
  }

  loadTranscripts(): void {
    this.stopPolling();
    this.refreshSub?.unsubscribe();
    this.listSub?.unsubscribe();
    this.loading = true;
    this.state = "ok";
    this.listSub = this.voicedocService.listTranscripts(this.pageIndex + 1, this.pageSize, this.source || undefined).subscribe({
      next: res => {
        this.items = res?.data?.items ?? [];
        this.total = res?.data?.total ?? 0;
        this.loading = false;
        this.evaluatePolling();
      },
      error: err => {
        this.items = [];
        this.total = 0;
        this.loading = false;
        this.state = err?.status === 403 ? "forbidden" : "error";
      }
    });
  }

  get selectedTabIndex(): number {
    return Math.max(0, this.sourceOptions.findIndex(option => option.value === this.source));
  }

  onTabChange(index: number): void {
    const option = this.sourceOptions[index];
    if (option && option.value !== this.source) this.onSourceChange(option.value);
  }

  onSourceChange(source: VoiceTranscriptSource | ""): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { source: source || null },
      queryParamsHandling: "merge"
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTranscripts();
  }

  openDetail(item: VoicedocTranscriptItem): void {
    this.dialog.open(VoiceTranscriptDetailComponent, {
      panelClass: "modal-lg",
      data: { id: item.id, item },
      hasBackdrop: true
    });
  }

  shortUuid(uuid: string): string {
    return uuid ? uuid.slice(0, 8) : "-";
  }

  duration(seconds: number): string {
    return formatDuration(seconds);
  }
}
