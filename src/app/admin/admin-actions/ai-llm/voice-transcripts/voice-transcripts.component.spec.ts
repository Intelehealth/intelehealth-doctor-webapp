import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, convertToParamMap, ParamMap, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, NEVER, of, Subject, throwError } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { VoicedocService, VoicedocTranscriptItem } from 'src/app/services/voicedoc.service';
import { VoiceTranscriptsComponent } from './voice-transcripts.component';
import { VoiceTranscriptDetailComponent } from './voice-transcript-detail/voice-transcript-detail.component';

function makeItem(i: number): VoicedocTranscriptItem {
  return {
    id: `t${i}`,
    visitUuid: `visit-uuid-${i}-0000-0000`,
    patientUuid: `p${i}`,
    patientName: `Patient ${i}`,
    patientIdentifier: `ID-${i}`,
    doctorUuid: 'd1',
    doctorName: 'Dr Who',
    chwUuid: 'c1',
    chwName: 'Nurse Joy',
    source: 'webapp',
    status: 'done',
    language: 'en',
    recordingName: `rec-${i}`,
    chunksReceived: 6,
    chunksUploaded: 6,
    chunksFailed: i === 0 ? 1 : 0,
    startedAt: '2026-10-30T10:00:00.000Z',
    endedAt: '2026-10-30T10:01:05.000Z',
    durationSec: 65,
    transcriptPreview: 'hello',
    hasSummary: true,
    error: null
  };
}

describe('VoiceTranscriptsComponent', () => {
  let fixture: ComponentFixture<VoiceTranscriptsComponent>;
  let component: VoiceTranscriptsComponent;
  let voicedoc: jasmine.SpyObj<VoicedocService>;
  let router: jasmine.SpyObj<Router>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let queryParamMap: BehaviorSubject<ParamMap>;

  const listResponse = (items: VoicedocTranscriptItem[], total: number, page = 1) =>
    of({ success: true, data: { items, total, page, limit: 10 } });

  function setup(source?: string) {
    queryParamMap = new BehaviorSubject(convertToParamMap(source ? { source } : {}));
    voicedoc = jasmine.createSpyObj<VoicedocService>('VoicedocService', ['listTranscripts', 'getTranscript']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    TestBed.configureTestingModule({
      declarations: [VoiceTranscriptsComponent],
      imports: [MatTableModule, MatPaginatorModule, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: VoicedocService, useValue: voicedoc },
        { provide: Router, useValue: router },
        { provide: MatDialog, useValue: dialog },
        { provide: ActivatedRoute, useValue: { queryParamMap } },
        { provide: PageTitleService, useValue: { setTitle: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    spyOn(TestBed.inject(TranslateService), 'use').and.returnValue(of({}));
  }

  function create() {
    fixture = TestBed.createComponent(VoiceTranscriptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('requests page 1, limit 10 and the source from the query param, and renders rows', () => {
    setup('webapp');
    voicedoc.listTranscripts.and.returnValue(listResponse([makeItem(0), makeItem(1)], 2));
    create();

    expect(voicedoc.listTranscripts).toHaveBeenCalledWith(1, 10, 'webapp');
    const rows = fixture.debugElement.queryAll(By.css('[data-test-id="rowVoiceTranscript"]'));
    expect(rows.length).toBe(2);
    const first = rows[0].nativeElement.textContent;
    expect(first).toContain('Patient 0');
    expect(first).toContain('ID-0');
    expect(first).toContain('visit-uu');
    expect(first).toContain('Dr Who');
    expect(first).toContain('Nurse Joy');
    expect(first).toContain('Doctor webapp');
    expect(first).toContain('01:05');
    expect(first).toContain('6/6');
    expect(first).toContain('(1 failed)');
    expect(rows[0].query(By.css('[title="visit-uuid-0-0000-0000"]'))).toBeTruthy();
  });

  it('omits the source for "All" and ignores unknown values', () => {
    setup('bogus');
    voicedoc.listTranscripts.and.returnValue(listResponse([], 0));
    create();
    expect(voicedoc.listTranscripts).toHaveBeenCalledWith(1, 10, undefined);
    expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptsEmptyState"]').textContent).toContain('No recordings found.');
  });

  it('requests the next page when the paginator changes', () => {
    setup();
    voicedoc.listTranscripts.and.returnValue(listResponse(Array.from({ length: 10 }, (_, i) => makeItem(i)), 25));
    create();
    voicedoc.listTranscripts.calls.reset();

    fixture.debugElement.query(By.directive(MatPaginator)).componentInstance.nextPage();

    expect(voicedoc.listTranscripts).toHaveBeenCalledOnceWith(2, 10, undefined);
    expect(component.pageIndex).toBe(1);
  });

  it('reloads from page 1 when the source query param changes and writes the filter to the URL', () => {
    setup();
    voicedoc.listTranscripts.and.returnValue(listResponse([], 0));
    create();

    component.onSourceChange('mobile');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { source: 'mobile' }, queryParamsHandling: 'merge' }));

    component.pageIndex = 3;
    queryParamMap.next(convertToParamMap({ source: 'mobile' }));
    expect(voicedoc.listTranscripts).toHaveBeenCalledWith(1, 10, 'mobile');

    component.onSourceChange('');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { source: null } }));
  });

  it('selects the initial tab from the source query param', () => {
    setup('mobile');
    voicedoc.listTranscripts.and.returnValue(listResponse([], 0));
    create();
    expect(component.selectedTabIndex).toBe(2);
    expect(component.sourceOptions.map(o => o.label)).toEqual(['All', 'Web', 'Mobile']);
  });

  it('maps tab clicks to the source query param and reloads from page 1', () => {
    setup();
    voicedoc.listTranscripts.and.returnValue(listResponse([], 0));
    create();
    expect(component.selectedTabIndex).toBe(0);

    component.onTabChange(1);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { source: 'webapp' }, queryParamsHandling: 'merge' }));
    component.pageIndex = 3;
    queryParamMap.next(convertToParamMap({ source: 'webapp' }));
    expect(voicedoc.listTranscripts).toHaveBeenCalledWith(1, 10, 'webapp');
    expect(component.selectedTabIndex).toBe(1);

    component.onTabChange(0);
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { source: null } }));
  });

  it('shows "Admin access required" on 403', () => {
    setup();
    voicedoc.listTranscripts.and.returnValue(throwError({ status: 403 }));
    create();
    expect(component.state).toBe('forbidden');
    expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptsEmptyState"]').textContent).toContain('Admin access required');
  });

  it('shows an error state with retry on other failures', () => {
    setup();
    voicedoc.listTranscripts.and.returnValue(throwError({ status: 500 }));
    create();
    expect(component.state).toBe('error');
    expect(fixture.nativeElement.querySelector('[data-test-id="voiceTranscriptsEmptyState"]').textContent).toContain('Could not load transcripts.');
  });

  it('opens the detail dialog from the View action', () => {
    setup();
    const item = makeItem(0);
    voicedoc.listTranscripts.and.returnValue(listResponse([item], 1));
    create();
    fixture.nativeElement.querySelector('[data-test-id="linkViewVoiceTranscript"]').click();
    expect(dialog.open).toHaveBeenCalledWith(VoiceTranscriptDetailComponent, jasmine.objectContaining({ data: { id: 't0', item } }));
  });

  describe('auto refresh', () => {
    const withStatus = (i: number, status: any) => ({ ...makeItem(i), status });

    it('polls every 10s while a row is pending and stops once all rows are terminal', fakeAsync(() => {
      setup();
      voicedoc.listTranscripts.and.returnValues(
        listResponse([withStatus(0, 'recording')], 1),
        listResponse([withStatus(0, 'finalizing')], 1),
        listResponse([withStatus(0, 'done')], 1)
      );
      create();
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(1);

      tick(9999);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(1);
      tick(1);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(2);
      expect(voicedoc.listTranscripts.calls.mostRecent().args).toEqual([1, 10, undefined]);
      tick(10000);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(3);
      expect(component.items[0].status).toBe('done');

      tick(60000);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(3);
      fixture.destroy();
    }));

    it('does not poll when all rows are terminal', fakeAsync(() => {
      setup();
      voicedoc.listTranscripts.and.returnValue(listResponse([withStatus(0, 'done'), withStatus(1, 'error')], 2));
      create();
      tick(60000);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(1);
    }));

    it('keeps the last data and keeps polling after a transient error', fakeAsync(() => {
      setup();
      voicedoc.listTranscripts.and.returnValues(
        listResponse([withStatus(0, 'recording')], 1),
        throwError({ status: 500 }),
        listResponse([withStatus(0, 'done')], 1)
      );
      create();
      tick(10000);
      expect(component.items.length).toBe(1);
      expect(component.state).toBe('ok');
      expect(component.loading).toBeFalse();
      tick(10000);
      expect(component.items[0].status).toBe('done');
      fixture.destroy();
    }));

    it('skips a tick while a request is still in flight', fakeAsync(() => {
      setup();
      const pending = new Subject<any>();
      voicedoc.listTranscripts.and.returnValues(
        listResponse([withStatus(0, 'recording')], 1),
        pending.asObservable() as any
      );
      create();
      tick(10000);
      tick(10000);
      tick(10000);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(2);
      pending.next({ success: true, data: { items: [withStatus(0, 'done')], total: 1, page: 1, limit: 10 } });
      pending.complete();
      tick(30000);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(2);
    }));

    it('does not show the loading bar during a silent refresh', fakeAsync(() => {
      setup();
      voicedoc.listTranscripts.and.returnValue(listResponse([withStatus(0, 'recording')], 1));
      create();
      voicedoc.listTranscripts.and.returnValue(NEVER);
      tick(10000);
      expect(component.loading).toBeFalse();
      fixture.destroy();
    }));

    it('refreshes immediately from the Refresh button using the current page', fakeAsync(() => {
      setup('mobile');
      voicedoc.listTranscripts.and.returnValue(listResponse([withStatus(0, 'done')], 25));
      create();
      component.pageIndex = 2;
      voicedoc.listTranscripts.calls.reset();
      fixture.nativeElement.querySelector('[data-test-id="btnRefreshVoiceTranscripts"]').click();
      expect(voicedoc.listTranscripts).toHaveBeenCalledOnceWith(3, 10, 'mobile');
      expect(component.pageIndex).toBe(2);
    }));

    it('stops polling on destroy', fakeAsync(() => {
      setup();
      voicedoc.listTranscripts.and.returnValue(listResponse([withStatus(0, 'recording')], 1));
      create();
      tick(10000);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(2);
      fixture.destroy();
      tick(60000);
      expect(voicedoc.listTranscripts).toHaveBeenCalledTimes(2);
    }));

    it('restarts evaluation after a page change', fakeAsync(() => {
      setup();
      voicedoc.listTranscripts.and.returnValue(listResponse([withStatus(0, 'recording')], 25));
      create();
      voicedoc.listTranscripts.and.returnValue(listResponse([withStatus(0, 'done')], 25));
      fixture.debugElement.query(By.directive(MatPaginator)).componentInstance.nextPage();
      voicedoc.listTranscripts.calls.reset();
      tick(60000);
      expect(voicedoc.listTranscripts).not.toHaveBeenCalled();
    }));
  });
});
