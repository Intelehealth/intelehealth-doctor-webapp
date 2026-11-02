import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { interval, Subscription } from "rxjs";
import { filter } from "rxjs/operators";
import { VoicedocService, VoicedocTranscriptChunk, VoicedocTranscriptDetail, VoicedocTranscriptItem } from "src/app/services/voicedoc.service";
import {
  buildSummarySections,
  ChunkLevelSummary,
  ChunkLevelView,
  chunkLevelView,
  extractChunkText,
  formatDuration,
  formatJsonHtml,
  stringifyJson,
  summarizeChunkLevels,
  SummarySection,
  VOICE_TRANSCRIPT_SOURCE_LABELS
} from "src/app/utils/voice-transcript";

export const VOICE_TRANSCRIPT_DETAIL_POLL_MS = 10000;

export interface VoiceTranscriptChunkRow {
  chunk: VoicedocTranscriptChunk;
  durationSec: string;
  local: ChunkLevelView;
  remote: ChunkLevelView;
  text: string;
  rawHtml: string;
}

export interface VoiceTranscriptDetailDialogData {
  id: string;
  item?: VoicedocTranscriptItem;
}

@Component({
  selector: "app-voice-transcript-detail",
  templateUrl: "./voice-transcript-detail.component.html",
  styleUrls: ["./voice-transcript-detail.component.scss"]
})
export class VoiceTranscriptDetailComponent implements OnInit, OnDestroy {
  loading = true;
  state: "ok" | "forbidden" | "error" = "ok";
  detail: VoicedocTranscriptDetail | VoicedocTranscriptItem | null = null;
  transcript: string | null = null;
  sections: SummarySection[] = [];
  showEmpty = false;
  copied = false;
  showJson = false;
  jsonHtml = "";
  copiedRecord = false;
  chunkRows: VoiceTranscriptChunkRow[] = [];
  levelSummary: ChunkLevelSummary | null = null;
  expandedChunks = new Set<number>();
  sourceLabels: { [key: string]: string } = VOICE_TRANSCRIPT_SOURCE_LABELS;

  private sub: Subscription;
  private pollSub: Subscription;
  private refreshSub: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: VoiceTranscriptDetailDialogData,
    private dialogRef: MatDialogRef<VoiceTranscriptDetailComponent>,
    private voicedocService: VoicedocService
  ) {
    this.detail = data?.item ?? null;
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.stopPolling();
    this.sub?.unsubscribe();
    this.refreshSub?.unsubscribe();
  }

  get pending(): boolean {
    const status = this.detail?.status;
    return status === "recording" || status === "finalizing";
  }

  private get fetching(): boolean {
    return this.loading || (!!this.refreshSub && !this.refreshSub.closed);
  }

  private applyDetail(detail: VoicedocTranscriptDetail | null): void {
    if (detail) this.detail = detail;
    this.transcript = detail?.transcript ?? null;
    this.sections = buildSummarySections(detail?.summary);
    this.chunkRows = (detail?.chunks || []).map(chunk => this.toChunkRow(chunk));
    this.levelSummary = this.chunkRows.length ? summarizeChunkLevels(detail.chunks) : null;
    if (this.showJson) this.jsonHtml = formatJsonHtml(this.detail);
  }

  private toChunkRow(chunk: VoicedocTranscriptChunk): VoiceTranscriptChunkRow {
    const raw: { [key: string]: any } = {};
    if (chunk.response !== null && chunk.response !== undefined) raw.response = chunk.response;
    if (chunk.error) raw.error = chunk.error;
    return {
      chunk,
      durationSec: typeof chunk.durationMs === "number" ? (chunk.durationMs / 1000).toFixed(1) : "-",
      local: chunkLevelView(chunk.localRms, chunk.localPeak, chunk.localSources),
      remote: chunkLevelView(chunk.remoteRms, chunk.remotePeak, chunk.remoteSources),
      text: extractChunkText(chunk.response),
      rawHtml: Object.keys(raw).length ? formatJsonHtml(raw) : ""
    };
  }

  private startPolling(): void {
    if (this.pollSub) return;
    this.pollSub = interval(VOICE_TRANSCRIPT_DETAIL_POLL_MS).pipe(
      filter(() => !this.fetching)
    ).subscribe(() => this.refresh());
  }

  private stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = undefined;
  }

  private evaluatePolling(): void {
    if (this.pending) {
      this.startPolling();
    } else {
      this.stopPolling();
    }
  }

  private refresh(): void {
    this.refreshSub?.unsubscribe();
    this.refreshSub = this.voicedocService.getTranscript(this.data.id).subscribe({
      next: res => {
        this.applyDetail(res?.data ?? null);
        this.evaluatePolling();
      },
      error: () => { }
    });
  }

  load(): void {
    this.stopPolling();
    this.refreshSub?.unsubscribe();
    this.sub?.unsubscribe();
    this.loading = true;
    this.state = "ok";
    this.sub = this.voicedocService.getTranscript(this.data.id).subscribe({
      next: res => {
        this.applyDetail(res?.data ?? null);
        this.loading = false;
        this.evaluatePolling();
      },
      error: err => {
        this.loading = false;
        this.state = err?.status === 403 ? "forbidden" : "error";
      }
    });
  }

  get visibleSections(): SummarySection[] {
    return this.showEmpty ? this.sections : this.sections.filter(section => !section.empty);
  }

  get emptySectionCount(): number {
    return this.sections.filter(section => section.empty).length;
  }

  get rawSummary(): unknown {
    return (this.detail as VoicedocTranscriptDetail)?.summary ?? null;
  }

  duration(seconds: number): string {
    return formatDuration(seconds);
  }

  toggleJson(): void {
    this.showJson = !this.showJson;
    this.jsonHtml = this.showJson ? formatJsonHtml(this.detail) : "";
  }

  copyRecordJson(): void {
    navigator.clipboard?.writeText(stringifyJson(this.detail)).then(() => {
      this.copiedRecord = true;
      setTimeout(() => (this.copiedRecord = false), 2000);
    }).catch(() => {});
  }

  toggleChunk(chunkNumber: number): void {
    if (this.expandedChunks.has(chunkNumber)) {
      this.expandedChunks.delete(chunkNumber);
    } else {
      this.expandedChunks.add(chunkNumber);
    }
  }

  trackChunk(_index: number, row: VoiceTranscriptChunkRow): number {
    return row.chunk.chunkNumber;
  }

  copyRawJson(): void {
    const text = JSON.stringify(this.rawSummary, null, 2);
    navigator.clipboard?.writeText(text).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    }).catch(() => {});
  }

  close(): void {
    this.dialogRef.close();
  }
}
