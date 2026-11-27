import {
  buildSummarySections,
  chunkLevelView,
  extractChunkText,
  formatDuration,
  formatJsonHtml,
  humanizeKey,
  isVoiceTranscriptEnabled,
  levelBarPercent,
  SILENT_RMS_THRESHOLD,
  summarizeChunkLevels
} from './voice-transcript';

describe('voice-transcript utils', () => {
  const flags = { record_transcribe_webapp: true, record_transcribe_mobile: false, feed_ai_ddx: false, autofill_doctor_notes: false };

  describe('isVoiceTranscriptEnabled', () => {
    it('is true only when the section and the source flag are both on', () => {
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: true, ai_llm_voice_transcript: flags }, 'webapp')).toBeTrue();
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: true, ai_llm_voice_transcript: flags }, 'mobile')).toBeFalse();
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: false, ai_llm_voice_transcript: flags }, 'webapp')).toBeFalse();
    });

    it('accepts 1 and "1" for the section flag', () => {
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: 1, ai_llm_voice_transcript: flags }, 'webapp')).toBeTrue();
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: '1', ai_llm_voice_transcript: flags }, 'webapp')).toBeTrue();
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: 0, ai_llm_voice_transcript: flags }, 'webapp')).toBeFalse();
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: '0', ai_llm_voice_transcript: flags }, 'webapp')).toBeFalse();
    });

    it('parses the sub-flags from a JSON string', () => {
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: true, ai_llm_voice_transcript: JSON.stringify(flags) }, 'webapp')).toBeTrue();
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: true, ai_llm_voice_transcript: 'not json' }, 'webapp')).toBeFalse();
    });

    it('requires the sub-flag to be strictly true', () => {
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: true, ai_llm_voice_transcript: { record_transcribe_webapp: 1 as any } }, 'webapp')).toBeFalse();
    });

    it('is false for missing config', () => {
      expect(isVoiceTranscriptEnabled(null, 'webapp')).toBeFalse();
      expect(isVoiceTranscriptEnabled({}, 'webapp')).toBeFalse();
      expect(isVoiceTranscriptEnabled({ ai_llm_voice_transcript_section: true }, 'webapp')).toBeFalse();
    });
  });

  describe('buildSummarySections', () => {
    const summary = {
      'Diagnosis': [{ diagnosisName: 'Fever', icdCode: 'R50', onset: '', note: null }],
      'Medications': [],
      'Advice and Instructions': ['Drink water', ''],
      'Vitals': [{}]
    };

    it('builds label/value fields for objects and bullets for strings, marking empty sections', () => {
      const sections = buildSummarySections(summary);
      expect(sections.map(s => s.title)).toEqual(['Diagnosis', 'Medications', 'Advice and Instructions', 'Vitals']);
      expect(sections[0].empty).toBeFalse();
      expect(sections[0].entries[0].fields).toEqual([
        { label: 'Diagnosis name', value: 'Fever' },
        { label: 'Icd code', value: 'R50' }
      ]);
      expect(sections[1].empty).toBeTrue();
      expect(sections[2].entries).toEqual([{ text: 'Drink water' }]);
      expect(sections[3].empty).toBeTrue();
    });

    it('accepts a JSON string and ignores non-objects', () => {
      expect(buildSummarySections(JSON.stringify(summary)).length).toBe(4);
      expect(buildSummarySections(null)).toEqual([]);
      expect(buildSummarySections([1, 2])).toEqual([]);
      expect(buildSummarySections('plain text')).toEqual([{ title: 'Summary', entries: [{ text: 'plain text' }], empty: false }]);
    });
  });

  it('humanizes keys', () => {
    expect(humanizeKey('clinicalStatus')).toBe('Clinical status');
    expect(humanizeKey('verification_status')).toBe('Verification status');
    expect(humanizeKey('ICD10Code')).toBe('ICD10 code');
  });

  it('formats durations as mm:ss', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65)).toBe('01:05');
    expect(formatDuration(3725)).toBe('62:05');
    expect(formatDuration(null)).toBe('-');
  });

  describe('extractChunkText', () => {
    it('reads the common transcript fields', () => {
      expect(extractChunkText({ transcript: ' hello ' })).toBe('hello');
      expect(extractChunkText({ text: 'plain' })).toBe('plain');
      expect(extractChunkText({ result: { transcript: 'nested result' } })).toBe('nested result');
      expect(extractChunkText({ data: { transcript: 'nested data' } })).toBe('nested data');
      expect(extractChunkText({ chunk_transcript: 'chunk' })).toBe('chunk');
      expect(extractChunkText(JSON.stringify({ text: 'from string' }))).toBe('from string');
    });

    it('prefers transcript over text and skips blanks', () => {
      expect(extractChunkText({ transcript: 'a', text: 'b' })).toBe('a');
      expect(extractChunkText({ transcript: '  ', text: 'b' })).toBe('b');
    });

    it('returns empty for missing or unusable responses', () => {
      expect(extractChunkText(null)).toBe('');
      expect(extractChunkText(undefined)).toBe('');
      expect(extractChunkText('not json')).toBe('');
      expect(extractChunkText({ status: 'ok' })).toBe('');
      expect(extractChunkText({ transcript: 42 })).toBe('');
    });
  });

  describe('formatJsonHtml', () => {
    it('pretty prints with 2-space indent and colours tokens', () => {
      const html = formatJsonHtml({ a: 'x', n: 1.5, ok: true, z: null });
      expect(html).toContain('\n  <span class="json-key">"a":</span> <span class="json-string">"x"</span>');
      expect(html).toContain('<span class="json-number">1.5</span>');
      expect(html).toContain('<span class="json-boolean">true</span>');
      expect(html).toContain('<span class="json-null">null</span>');
    });

    it('escapes HTML inside values and leaves numbers inside strings alone', () => {
      const html = formatJsonHtml({ s: '<b>12</b>' });
      expect(html).toContain('<span class="json-string">"&lt;b&gt;12&lt;/b&gt;"</span>');
      expect(html).not.toContain('<b>');
      expect(html).not.toContain('json-number');
    });
  });

  describe('chunk levels', () => {
    it('classifies levels', () => {
      expect(chunkLevelView(0.1, 0.4, 1).state).toBe('ok');
      expect(chunkLevelView(SILENT_RMS_THRESHOLD / 2, 0.01, 1).state).toBe('silent');
      expect(chunkLevelView(null, null, 2).state).toBe('na');
      expect(chunkLevelView(null, null, 0).state).toBe('detached');
      expect(chunkLevelView(0, 0, 0).state).toBe('detached');
      expect(chunkLevelView(null, null, null).state).toBe('unknown');
    });

    it('maps rms onto a dB meter', () => {
      expect(levelBarPercent(1)).toBe(100);
      expect(levelBarPercent(0.001)).toBe(0);
      expect(levelBarPercent(0.1)).toBe(67);
      expect(levelBarPercent(null)).toBe(0);
    });

    it('summarizes detected chunks per side', () => {
      expect(summarizeChunkLevels([
        { localRms: 0.1, remoteRms: 0.001 },
        { localRms: 0.001, remoteRms: 0.2 },
        { localRms: null, remoteRms: 0.05 },
        {}
      ])).toEqual({ localDetected: 1, localMeasured: 2, remoteDetected: 2, remoteMeasured: 3 });
      expect(summarizeChunkLevels(null)).toEqual({ localDetected: 0, localMeasured: 0, remoteDetected: 0, remoteMeasured: 0 });
    });
  });
});
