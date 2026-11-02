export type VoiceTranscriptSource = 'webapp' | 'mobile';

export interface VoiceTranscriptFlags {
  record_transcribe_webapp: boolean;
  record_transcribe_mobile: boolean;
  feed_ai_ddx: boolean;
  autofill_doctor_notes: boolean;
}

export interface VoiceTranscriptConfig {
  ai_llm_voice_transcript_section?: boolean | number | string;
  ai_llm_voice_transcript?: Partial<VoiceTranscriptFlags> | string;
}

export const VOICE_TRANSCRIPT_SOURCE_LABELS: Record<VoiceTranscriptSource, string> = {
  webapp: 'Doctor webapp',
  mobile: 'Mobile'
};

const SOURCE_FLAG: Record<VoiceTranscriptSource, keyof VoiceTranscriptFlags> = {
  webapp: 'record_transcribe_webapp',
  mobile: 'record_transcribe_mobile'
};

function isOn(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function parseFlags(value: unknown): Partial<VoiceTranscriptFlags> {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_e) {
      return {};
    }
  }
  return value && typeof value === 'object' ? value as Partial<VoiceTranscriptFlags> : {};
}

export function isVoiceTranscriptEnabled(cfg: VoiceTranscriptConfig | null | undefined, source: VoiceTranscriptSource): boolean {
  if (!cfg || !isOn(cfg.ai_llm_voice_transcript_section)) return false;
  const flag = SOURCE_FLAG[source];
  return !!flag && parseFlags(cfg.ai_llm_voice_transcript)[flag] === true;
}

export interface SummaryField {
  label: string;
  value: string;
}

export interface SummaryEntry {
  text?: string;
  fields?: SummaryField[];
}

export interface SummarySection {
  title: string;
  entries: SummaryEntry[];
  empty: boolean;
}

export function humanizeKey(key: string): string {
  const words = String(key ?? '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words
    .map((word, i) => {
      if (/^[A-Z0-9]{2,}$/.test(word)) return word;
      const lower = word.toLowerCase();
      return i === 0 ? lower.charAt(0).toUpperCase() + lower.slice(1) : lower;
    })
    .join(' ');
}

function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.every(isBlank);
  if (typeof value === 'object') return Object.values(value as object).every(isBlank);
  return false;
}

function stringifyValue(value: unknown): string {
  if (Array.isArray(value)) {
    return value.filter(v => !isBlank(v)).map(stringifyValue).join(', ');
  }
  if (value && typeof value === 'object') {
    return Object.entries(value as object)
      .filter(([, v]) => !isBlank(v))
      .map(([k, v]) => `${humanizeKey(k)}: ${stringifyValue(v)}`)
      .join('; ');
  }
  return String(value).trim();
}

function toEntry(value: unknown): SummaryEntry | null {
  if (isBlank(value)) return null;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const fields = Object.entries(value as object)
      .filter(([, v]) => !isBlank(v))
      .map(([k, v]) => ({ label: humanizeKey(k), value: stringifyValue(v) }));
    return fields.length ? { fields } : null;
  }
  return { text: stringifyValue(value) };
}

export function buildSummarySections(summary: unknown): SummarySection[] {
  let data = summary;
  if (typeof summary === 'string') {
    try {
      data = JSON.parse(summary);
    } catch (_e) {
      const text = summary.trim();
      return text ? [{ title: 'Summary', entries: [{ text }], empty: false }] : [];
    }
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
  return Object.entries(data as object).map(([title, value]) => {
    const items = Array.isArray(value) ? value : [value];
    const entries = items.map(toEntry).filter((e): e is SummaryEntry => !!e);
    return { title, entries, empty: entries.length === 0 };
  });
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(Number(seconds))) return '-';
  const total = Math.max(0, Math.round(Number(seconds)));
  const mm = Math.floor(total / 60);
  const ss = total % 60;
  return `${mm < 10 ? '0' + mm : mm}:${ss < 10 ? '0' + ss : ss}`;
}

export const SILENT_RMS_THRESHOLD = 0.005;
export const LEVEL_METER_FLOOR_DB = -60;

export type ChunkLevelState = 'ok' | 'silent' | 'na' | 'detached' | 'unknown';

export interface ChunkLevelView {
  state: ChunkLevelState;
  rms: number | null;
  peak: number | null;
  barPercent: number;
}

export interface ChunkLevelInput {
  localRms?: number | null;
  localPeak?: number | null;
  remoteRms?: number | null;
  remotePeak?: number | null;
  localSources?: number | null;
  remoteSources?: number | null;
}

export interface ChunkLevelSummary {
  localDetected: number;
  localMeasured: number;
  remoteDetected: number;
  remoteMeasured: number;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function levelBarPercent(rms: number | null | undefined): number {
  if (!isNumber(rms) || rms <= 0) return 0;
  const db = 20 * Math.log10(rms);
  const pct = ((db - LEVEL_METER_FLOOR_DB) / -LEVEL_METER_FLOOR_DB) * 100;
  return Math.max(0, Math.min(100, Math.round(pct)));
}

export function chunkLevelView(rms: number | null | undefined, peak: number | null | undefined, sources: number | null | undefined): ChunkLevelView {
  const measured = isNumber(rms) ? rms : null;
  const view: ChunkLevelView = { state: 'unknown', rms: measured, peak: isNumber(peak) ? peak : null, barPercent: levelBarPercent(measured) };
  if (sources === 0) view.state = 'detached';
  else if (measured === null) view.state = isNumber(sources) && sources > 0 ? 'na' : 'unknown';
  else view.state = measured < SILENT_RMS_THRESHOLD ? 'silent' : 'ok';
  return view;
}

export function summarizeChunkLevels(chunks: ChunkLevelInput[] | null | undefined): ChunkLevelSummary {
  const summary: ChunkLevelSummary = { localDetected: 0, localMeasured: 0, remoteDetected: 0, remoteMeasured: 0 };
  (chunks || []).forEach(chunk => {
    if (isNumber(chunk.localRms)) {
      summary.localMeasured++;
      if (chunk.localRms >= SILENT_RMS_THRESHOLD) summary.localDetected++;
    }
    if (isNumber(chunk.remoteRms)) {
      summary.remoteMeasured++;
      if (chunk.remoteRms >= SILENT_RMS_THRESHOLD) summary.remoteDetected++;
    }
  });
  return summary;
}

const CHUNK_TEXT_PATHS = [['transcript'], ['text'], ['result', 'transcript'], ['data', 'transcript'], ['chunk_transcript']];

export function extractChunkText(response: unknown): string {
  let data = response;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (_e) {
      return '';
    }
  }
  if (!data || typeof data !== 'object') return '';
  for (const path of CHUNK_TEXT_PATHS) {
    const value = path.reduce((obj: any, key) => (obj && typeof obj === 'object' ? obj[key] : undefined), data);
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const JSON_TOKEN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

export function stringifyJson(value: unknown): string {
  const text = JSON.stringify(value === undefined ? null : value, null, 2);
  return text === undefined ? 'null' : text;
}

export function formatJsonHtml(value: unknown): string {
  return escapeHtml(stringifyJson(value)).replace(JSON_TOKEN, (match: string) => {
    let cls = 'json-number';
    if (match.startsWith('"')) cls = /:\s*$/.test(match) ? 'json-key' : 'json-string';
    else if (match === 'true' || match === 'false') cls = 'json-boolean';
    else if (match === 'null') cls = 'json-null';
    return `<span class="${cls}">${match}</span>`;
  });
}
