import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NEVER, of, throwError } from 'rxjs';
import { VoicedocService } from 'src/app/services/voicedoc.service';
import { VoiceTranscriptDetailComponent } from './voice-transcript-detail.component';

describe('VoiceTranscriptDetailComponent', () => {
  let fixture: ComponentFixture<VoiceTranscriptDetailComponent>;
  let voicedoc: jasmine.SpyObj<VoicedocService>;

  const detail = {
    id: 't1',
    visitUuid: 'visit-1',
    patientName: 'Patient One',
    patientIdentifier: 'ID-1',
    doctorName: 'Dr Who',
    chwName: 'Nurse Joy',
    source: 'mobile',
    status: 'done',
    durationSec: 90,
    chunksReceived: 9,
    chunksUploaded: 9,
    chunksFailed: 0,
    transcript: 'Doctor: hello\nPatient: hi',
    summary: {
      'Diagnosis': [{ diagnosisName: 'Fever', icdCode: 'R50', note: '' }],
      'Medications': [],
      'Advice and Instructions': ['Rest'],
      'Vitals': []
    }
  };

  function create(response: any) {
    voicedoc = jasmine.createSpyObj<VoicedocService>('VoicedocService', ['getTranscript', 'regenerateVisitSummary']);
    voicedoc.getTranscript.and.returnValue(response);
    TestBed.configureTestingModule({
      declarations: [VoiceTranscriptDetailComponent],
      imports: [FormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: VoicedocService, useValue: voicedoc },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: { id: 't1' } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    fixture = TestBed.createComponent(VoiceTranscriptDetailComponent);
    fixture.detectChanges();
  }

  const sectionTitles = () =>
    Array.from(fixture.nativeElement.querySelectorAll('[data-test-id="voiceTranscriptSummarySection"] .section-title'))
      .map((el: HTMLElement) => el.textContent.trim());

  it('loads the transcript and renders only non-empty summary sections', () => {
    create(of({ success: true, data: detail }));
    expect(voicedoc.getTranscript).toHaveBeenCalledWith('t1');
    expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptText"]').textContent).toContain('Patient: hi');
    expect(sectionTitles()).toEqual(['Diagnosis', 'Advice and Instructions']);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Diagnosis name: Fever');
    expect(text).toContain('Icd code: R50');
    expect(text).not.toContain('Note:');
    expect(text).toContain('Rest');
    expect(text).toContain('Patient One');
  });

  it('shows empty sections when toggled', () => {
    create(of({ success: true, data: detail }));
    fixture.componentInstance.showEmpty = true;
    fixture.detectChanges();
    expect(sectionTitles()).toEqual(['Diagnosis', 'Medications', 'Advice and Instructions', 'Vitals']);
  });

  it('shows "Admin access required" on 403', () => {
    create(throwError({ status: 403 }));
    expect(fixture.nativeElement.textContent).toContain('Admin access required');
  });

  describe('auto refresh', () => {
    const withStatus = (status: string): any => ({ success: true, data: { ...detail, status } });

    it('polls every 10s while recording or finalizing, then stops at a terminal status', fakeAsync(() => {
      create(of(withStatus('recording')));
      voicedoc.getTranscript.and.returnValues(of(withStatus('finalizing')), of(withStatus('done')));
      voicedoc.getTranscript.calls.reset();

      expect(fixture.componentInstance.pending).toBeTrue();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptDetailUpdating"]')).toBeTruthy();

      tick(9999);
      expect(voicedoc.getTranscript).not.toHaveBeenCalled();
      tick(1);
      expect(voicedoc.getTranscript).toHaveBeenCalledTimes(1);
      tick(10000);
      expect(voicedoc.getTranscript).toHaveBeenCalledTimes(2);
      expect(fixture.componentInstance.detail.status).toBe('done');
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptDetailUpdating"]')).toBeNull();

      tick(60000);
      expect(voicedoc.getTranscript).toHaveBeenCalledTimes(2);
    }));

    it('does not poll when the transcript is already terminal', fakeAsync(() => {
      create(of(withStatus('done')));
      voicedoc.getTranscript.calls.reset();
      tick(60000);
      expect(voicedoc.getTranscript).not.toHaveBeenCalled();
    }));

    it('keeps the last data after a transient error and keeps polling', fakeAsync(() => {
      create(of(withStatus('recording')));
      voicedoc.getTranscript.and.returnValues(throwError({ status: 500 }), of(withStatus('done')));
      tick(10000);
      expect(fixture.componentInstance.state).toBe('ok');
      expect(fixture.componentInstance.transcript).toContain('Patient: hi');
      tick(10000);
      expect(fixture.componentInstance.detail.status).toBe('done');
    }));

    it('skips a tick while a request is in flight', fakeAsync(() => {
      create(of(withStatus('recording')));
      voicedoc.getTranscript.calls.reset();
      voicedoc.getTranscript.and.returnValue(NEVER);
      tick(50000);
      expect(voicedoc.getTranscript).toHaveBeenCalledTimes(1);
      fixture.destroy();
    }));

    it('stops polling on destroy', fakeAsync(() => {
      create(of(withStatus('recording')));
      voicedoc.getTranscript.calls.reset();
      fixture.destroy();
      tick(60000);
      expect(voicedoc.getTranscript).not.toHaveBeenCalled();
    }));
  });

  describe('visit summary', () => {
    const el = (id: string) => fixture.nativeElement.querySelector(`[data-test-id="${id}"]`);
    const stored = {
      ...detail,
      endedAt: '2026-11-04T10:00:00Z',
      visitSummary: 'Fever for three days, advised rest.',
      visitSummaryAt: '2026-11-04T10:01:00Z',
      visitSummaryResponse: { overall_summary: 'Fever for three days, advised rest.', visits_found: 2, visits: ['MR-p_v Nov 4 2026 03:49 PM', 'MR-p_v Nov 4 2026 04:10 PM'] },
      noteStatus: 'saved',
      noteObsUuid: 'obs-1'
    };

    it('shows the stored summary of all visit recordings and the doctor note status', () => {
      create(of({ success: true, data: stored }));
      expect(el('voiceTranscriptVisitSummary').textContent).toContain('Fever for three days');
      expect(el('voiceTranscriptVisitSummaryCount').textContent).toContain('2');
      expect(el('voiceTranscriptNoteStatus').textContent).toContain("Saved to doctor's notes");
      expect(voicedoc.regenerateVisitSummary).not.toHaveBeenCalled();
    });

    it('explains why the note was not saved', () => {
      create(of({ success: true, data: { ...stored, noteStatus: 'error', noteError: 'HTTP 500' } }));
      expect(el('voiceTranscriptNoteStatus').textContent).toContain("Could not save to doctor's notes: HTTP 500");
    });

    it('regenerates on demand and shows an error when it fails', () => {
      create(of({ success: true, data: stored }));
      voicedoc.regenerateVisitSummary.and.returnValue(throwError({ status: 502 }));
      el('linkRegenerateVisitSummary').click();
      fixture.detectChanges();
      expect(el('voiceTranscriptVisitSummaryError')).toBeTruthy();
      voicedoc.regenerateVisitSummary.and.returnValue(of({ success: true, data: { ...stored, visitSummary: 'New merged summary', noteStatus: 'updated' } }) as any);
      el('linkRegenerateVisitSummary').click();
      fixture.detectChanges();
      expect(voicedoc.regenerateVisitSummary).toHaveBeenCalledWith('t1');
      expect(el('voiceTranscriptVisitSummary').textContent).toContain('New merged summary');
      expect(el('voiceTranscriptNoteStatus').textContent).toContain("Updated in doctor's notes");
    });

    it('keeps polling for a few minutes after the call until the summary is generated', fakeAsync(() => {
      const fresh = { ...detail, endedAt: new Date().toISOString(), visitSummary: null, visitSummaryAt: null };
      create(of({ success: true, data: fresh }));
      expect(el('voiceTranscriptVisitSummaryLoading')).toBeTruthy();
      voicedoc.getTranscript.and.returnValue(of({ success: true, data: { ...stored, endedAt: fresh.endedAt } }) as any);
      tick(10000);
      fixture.detectChanges();
      expect(el('voiceTranscriptVisitSummary').textContent).toContain('Fever for three days');
      expect(fixture.componentInstance.pending).toBeFalse();
      fixture.destroy();
    }));
  });

  describe('chunks debug flag', () => {
    afterEach(() => localStorage.removeItem('debug'));

    it('hides the chunk table unless localStorage debug is on', () => {
      localStorage.removeItem('debug');
      create(of({ success: true, data: { ...detail, chunks: [{ chunkNumber: 1, status: 'uploaded', attempts: 1 }] } }));
      expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptChunkTable"]')).toBeNull();
    });

    it('shows the chunk table when localStorage debug is true', () => {
      localStorage.setItem('debug', 'true');
      create(of({ success: true, data: { ...detail, chunks: [{ chunkNumber: 1, status: 'uploaded', attempts: 1 }] } }));
      expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptChunkTable"]')).toBeTruthy();
    });
  });

  describe('raw JSON and chunks', () => {
    beforeEach(() => localStorage.setItem('debug', '1'));
    afterEach(() => localStorage.removeItem('debug'));

    const chunk = (over: any) => ({
      chunkNumber: 1, status: 'uploaded', attempts: 1, bytes: 320044, durationMs: 10000,
      localRms: 0.12, localPeak: 0.5, remoteRms: 0.08, remotePeak: 0.4, localSources: 1, remoteSources: 1,
      response: null, error: null, uploadedAt: '2026-11-02T10:00:00Z', ...over
    });
    const record: any = {
      ...detail,
      rawResponse: { status: 'ok', transcript: 'full' },
      combinedAudioResponse: { url: 'https://x/a.wav' },
      chunks: [
        chunk({ chunkNumber: 1, response: { transcript: 'first chunk' } }),
        chunk({ chunkNumber: 2, localRms: 0.001, response: { result: { transcript: 'second chunk' } } }),
        chunk({ chunkNumber: 3, localRms: null, localPeak: null, localSources: 0, status: 'failed', attempts: 4, error: 'boom' }),
        chunk({ chunkNumber: 4, remoteRms: null, remotePeak: null, remoteSources: 2, durationMs: 4500 })
      ]
    };
    const q = (sel: string) => fixture.nativeElement.querySelector(sel);
    const qa = (sel: string): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll(sel));

    it('toggles a pretty-printed JSON view of the full record', () => {
      create(of({ success: true, data: record }));
      const button = q('[data-test-id="btnToggleRecordJson"]');
      expect(button.textContent).toContain('Expand JSON');
      expect(q('[data-test-id="voiceTranscriptRecordJson"]')).toBeNull();
      button.click();
      fixture.detectChanges();
      const pre = q('[data-test-id="voiceTranscriptRecordJson"]');
      expect(button.textContent).toContain('Collapse JSON');
      expect(pre.textContent).toBe(JSON.stringify(record, null, 2));
      expect(pre.querySelector('.json-key')).toBeTruthy();
      expect(pre.textContent).toContain('"combinedAudioResponse"');
      expect(pre.textContent).toContain('"chunkNumber": 3');
      button.click();
      fixture.detectChanges();
      expect(q('[data-test-id="voiceTranscriptRecordJson"]')).toBeNull();
    });

    it('renders chunk rows with levels, silent badge, detached warning and chunk text', () => {
      create(of({ success: true, data: record }));
      const rows = qa('[data-test-id="voiceTranscriptChunkRow"]');
      expect(rows.length).toBe(4);
      expect(rows[0].textContent).toContain('10.0');
      expect(rows[0].textContent).toContain('0.1200');
      expect(rows[0].querySelector('[data-test-id="voiceTranscriptChunkText"]').textContent.trim()).toBe('first chunk');
      expect(rows[1].querySelector('[data-test-id="voiceTranscriptSilentBadge"]')).toBeTruthy();
      expect(rows[1].querySelector('[data-test-id="voiceTranscriptChunkText"]').textContent.trim()).toBe('second chunk');
      expect(rows[0].querySelector('[data-test-id="voiceTranscriptSilentBadge"]')).toBeNull();
      expect(rows[2].querySelector('[data-test-id="voiceTranscriptLevelDetached"]').textContent).toContain('Doctor mic not attached');
      expect(rows[2].querySelector('.status-chip').classList).toContain('status-failed');
      expect(rows[3].textContent).toContain('n/a');
      expect(rows[3].textContent).toContain('4.5');
    });

    it('shows the level summary line', () => {
      create(of({ success: true, data: record }));
      const text = q('[data-test-id="voiceTranscriptLevelSummary"]').textContent.replace(/\s+/g, ' ');
      expect(text).toContain('Doctor audio detected in 2/3 chunks');
      expect(text).toContain('HW audio detected in 3/3 chunks');
    });

    it('expands a chunk to show its raw response or error', () => {
      create(of({ success: true, data: record }));
      const toggles = qa('[data-test-id="linkToggleChunkRaw"]');
      expect(toggles.length).toBe(3);
      toggles[2].click();
      fixture.detectChanges();
      const raw = qa('[data-test-id="voiceTranscriptChunkRaw"]');
      expect(raw.length).toBe(1);
      expect(raw[0].textContent).toContain('"error": "boom"');
    });

    it('keeps chunk expansion across polling refreshes', fakeAsync(() => {
      create(of({ success: true, data: { ...record, status: 'finalizing' } }));
      fixture.componentInstance.toggleChunk(1);
      voicedoc.getTranscript.and.returnValue(of({ success: true, data: { ...record, status: 'done' } }));
      tick(10000);
      fixture.detectChanges();
      expect(fixture.componentInstance.chunkRows.length).toBe(4);
      expect(qa('[data-test-id="voiceTranscriptChunkRaw"]').length).toBe(1);
    }));

    it('handles older records without chunks or raw fields', () => {
      create(of({ success: true, data: detail }));
      expect(q('[data-test-id="voiceTranscriptChunkTable"]')).toBeNull();
      expect(fixture.componentInstance.levelSummary).toBeNull();
    });
  });
});
