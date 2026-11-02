import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';
import { VoiceTranscriptSource } from '../utils/voice-transcript';

export interface VoicedocSessionRequest {
  visitUuid: string;
  patientUuid: string;
  doctorUuid: string;
  chwUuid: string;
  roomId: string;
  language?: string;
}

export type VoicedocTranscriptStatus = 'recording' | 'finalizing' | 'done' | 'empty' | 'error';

export interface VoicedocTranscriptItem {
  id: string;
  visitUuid: string;
  patientUuid: string;
  patientName: string;
  patientIdentifier: string;
  doctorUuid: string;
  doctorName: string;
  chwUuid: string;
  chwName: string;
  source: VoiceTranscriptSource;
  status: VoicedocTranscriptStatus;
  language: string;
  recordingName: string;
  chunksReceived: number;
  chunksUploaded: number;
  chunksFailed: number;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  transcriptPreview: string;
  hasSummary: boolean;
  error: string;
}

export type VoicedocChunkStatus = 'queued' | 'uploaded' | 'failed' | 'skipped';

export interface VoicedocTranscriptChunk {
  chunkNumber: number;
  status: VoicedocChunkStatus;
  attempts: number;
  bytes: number | null;
  durationMs: number | null;
  localRms: number | null;
  localPeak: number | null;
  remoteRms: number | null;
  remotePeak: number | null;
  localSources: number | null;
  remoteSources: number | null;
  response: any | null;
  error: string | null;
  uploadedAt: string | null;
}

export interface VoicedocTranscriptDetail extends VoicedocTranscriptItem {
  transcript: string | null;
  summary: { [section: string]: any } | null;
  rawResponse?: { [key: string]: any } | null;
  combinedAudioResponse?: { [key: string]: any } | null;
  chunks?: VoicedocTranscriptChunk[];
}

export interface VoicedocTranscriptListResponse {
  success: boolean;
  data: {
    items: VoicedocTranscriptItem[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface VoicedocTranscriptDetailResponse {
  success: boolean;
  data: VoicedocTranscriptDetail;
}

export interface VoicedocSessionResponse {
  success: boolean;
  data: {
    sessionId: string;
    chunkId?: string;
    name?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class VoicedocService {
  private base = environment.voicedocURL;

  constructor(private http: HttpClient, private authService: AuthService) { }

  createSession(body: VoicedocSessionRequest): Observable<VoicedocSessionResponse> {
    return this.http.post<VoicedocSessionResponse>(`${this.base}/voicedoc/sessions`, { ...body, source: 'webapp' });
  }

  listTranscripts(page: number, limit: number, source?: VoiceTranscriptSource): Observable<VoicedocTranscriptListResponse> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));
    if (source) params = params.set('source', source);
    return this.http.get<VoicedocTranscriptListResponse>(`${this.base}/voicedoc/transcripts`, { params });
  }

  getTranscript(id: string): Observable<VoicedocTranscriptDetailResponse> {
    return this.http.get<VoicedocTranscriptDetailResponse>(`${this.base}/voicedoc/transcripts/${encodeURIComponent(id)}`);
  }

  uploadChunk(sessionId: string, blob: Blob, chunkNumber: number, fields?: Record<string, string>): Observable<any> {
    const form = new FormData();
    form.append('file', blob, `chunk-${chunkNumber}.wav`);
    form.append('chunkNumber', String(chunkNumber));
    Object.entries(fields || {}).forEach(([key, value]) => form.append(key, value));
    return this.http.post(`${this.base}/voicedoc/sessions/${encodeURIComponent(sessionId)}/chunks`, form);
  }

  endSession(sessionId: string): Observable<any> {
    return this.http.post(`${this.base}/voicedoc/sessions/${encodeURIComponent(sessionId)}/end`, {});
  }

  endSessionKeepalive(sessionId: string): void {
    try {
      const token = this.authService.authToken;
      fetch(`${this.base}/voicedoc/sessions/${encodeURIComponent(sessionId)}/end`, {
        method: 'POST',
        keepalive: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }).catch(() => {});
    } catch (_e) {}
  }
}
