import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { VoicedocRecorderService, VoicedocRecorderState } from 'src/app/services/voicedoc-recorder.service';
import { VisitSummaryV2Service } from '../visit-summary-v2.service';
import { KaleyraCallContext } from '../visit-summary-v2.models';
import { KaleyraCallRecorderComponent } from './kaleyra-call-recorder.component';

describe('KaleyraCallRecorderComponent', () => {
  let fixture: ComponentFixture<KaleyraCallRecorderComponent>;
  let component: KaleyraCallRecorderComponent;
  let calls: Subject<KaleyraCallContext>;
  let state: BehaviorSubject<VoicedocRecorderState>;
  let recorder: jasmine.SpyObj<VoicedocRecorderService>;
  let core: jasmine.SpyObj<CoreService>;
  let toastr: jasmine.SpyObj<ToastrService>;
  let config: any;
  const call: KaleyraCallContext = { visitUuid: 'v1', patientUuid: 'p1', doctorUuid: 'd1', chwUuid: 'c1' };
  const button = (id: string): HTMLButtonElement => fixture.nativeElement.querySelector(`[data-test-id="${id}"]`);

  beforeEach(() => {
    calls = new Subject<KaleyraCallContext>();
    state = new BehaviorSubject<VoicedocRecorderState>('idle');
    recorder = jasmine.createSpyObj<VoicedocRecorderService>('VoicedocRecorderService', ['start', 'pause', 'resume', 'stop']);
    (recorder as any).state$ = state;
    recorder.start.and.callFake(() => { state.next('recording'); return Promise.resolve(); });
    recorder.pause.and.callFake(() => state.next('paused'));
    recorder.resume.and.callFake(() => state.next('recording'));
    recorder.stop.and.callFake(() => { state.next('idle'); return Promise.resolve(); });
    core = jasmine.createSpyObj<CoreService>('CoreService', ['openConfirmationDialog']);
    toastr = jasmine.createSpyObj<ToastrService>('ToastrService', ['success', 'error', 'info']);
    config = { ai_llm_voice_transcript_section: true, ai_llm_voice_transcript: { record_transcribe_webapp: true } };

    TestBed.configureTestingModule({
      declarations: [KaleyraCallRecorderComponent],
      providers: [
        { provide: VisitSummaryV2Service, useValue: { kaleyraCallStarted$: calls } },
        { provide: AppConfigService, useFactory: () => config },
        { provide: CoreService, useValue: core },
        { provide: ToastrService, useValue: toastr }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).overrideComponent(KaleyraCallRecorderComponent, {
      set: { providers: [{ provide: VoicedocRecorderService, useValue: recorder }] }
    });
    fixture = TestBed.createComponent(KaleyraCallRecorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('auto starts recording on call start without showing the modal', () => {
    calls.next(call);
    fixture.detectChanges();
    expect(recorder.start).toHaveBeenCalledTimes(1);
    expect(recorder.start).toHaveBeenCalledWith({ visitUuid: 'v1', patientUuid: 'p1', doctorUuid: 'd1', chwUuid: 'c1' }, 'mic');
    expect(fixture.nativeElement.querySelector('[data-test-id="kaleyraCallRecorder"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kcr-bar')).toBeTruthy();
  });

  it('does not start when web call transcription is off', () => {
    config.ai_llm_voice_transcript = { record_transcribe_webapp: false };
    calls.next(call);
    fixture.detectChanges();
    expect(recorder.start).not.toHaveBeenCalled();
  });

  it('shows the fallback modal when auto start fails and retries on click', () => {
    recorder.start.and.callFake(() => { state.next('error'); return Promise.resolve(); });
    calls.next(call);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('[data-test-id="kaleyraCallRecorder"]');
    expect(modal).toBeTruthy();
    expect(modal.textContent).toContain('Recording could not start automatically');
    expect(toastr.info).not.toHaveBeenCalled();
    button('btnKaleyraRecordStart').click();
    expect(recorder.start).toHaveBeenCalledTimes(2);
  });

  it('shows the info toast once on first recording, not after pause and resume', () => {
    calls.next(call);
    fixture.detectChanges();
    expect(toastr.info).toHaveBeenCalledTimes(1);
    button('btnKaleyraRecordPause').click();
    fixture.detectChanges();
    button('btnKaleyraRecordResume').click();
    fixture.detectChanges();
    expect(toastr.info).toHaveBeenCalledTimes(1);
  });

  it('closes the fallback modal on Not now', () => {
    recorder.start.and.callFake(() => { state.next('error'); return Promise.resolve(); });
    calls.next(call);
    fixture.detectChanges();
    button('btnKaleyraRecordLater').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kcr-backdrop')).toBeNull();
  });

  it('stays hidden when web call transcription is turned off', () => {
    config.ai_llm_voice_transcript = { record_transcribe_webapp: false };
    calls.next(call);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.kcr-backdrop, .kcr-bar')).toBeNull();
  });

  it('starts a mic recording session for the visit, pauses, resumes and counts only recorded time', fakeAsync(() => {
    calls.next(call);
    fixture.detectChanges();
    expect(recorder.start).toHaveBeenCalledWith({ visitUuid: 'v1', patientUuid: 'p1', doctorUuid: 'd1', chwUuid: 'c1' }, 'mic');
    tick(3000);
    fixture.detectChanges();
    button('btnKaleyraRecordPause').click();
    expect(recorder.pause).toHaveBeenCalled();
    tick(5000);
    fixture.detectChanges();
    expect(component.elapsedLabel).toBe('00:03');
    button('btnKaleyraRecordResume').click();
    tick(2000);
    fixture.detectChanges();
    expect(component.elapsedLabel).toBe('00:05');
    fixture.destroy();
  }));

  it('stops only after the doctor confirms', fakeAsync(() => {
    calls.next(call);
    fixture.detectChanges();
    core.openConfirmationDialog.and.returnValue({ afterClosed: () => of(false) } as any);
    button('btnKaleyraRecordStop').click();
    expect(recorder.stop).not.toHaveBeenCalled();
    core.openConfirmationDialog.and.returnValue({ afterClosed: () => of(true) } as any);
    button('btnKaleyraRecordStop').click();
    tick();
    fixture.detectChanges();
    expect(recorder.stop).toHaveBeenCalled();
    expect(toastr.success).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.kcr-backdrop, .kcr-bar')).toBeNull();
    fixture.destroy();
  }));

  it('closes with an error toast when recording is disabled server-side', () => {
    calls.next(call);
    fixture.detectChanges();
    state.next('disabled');
    fixture.detectChanges();
    expect(recorder.stop).toHaveBeenCalled();
    expect(toastr.error).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.kcr-backdrop, .kcr-bar')).toBeNull();
  });

  it('returns to the start button with an error toast when the mic is unavailable', () => {
    calls.next(call);
    fixture.detectChanges();
    state.next('error');
    fixture.detectChanges();
    expect(toastr.error).toHaveBeenCalled();
    expect(button('btnKaleyraRecordStart')).toBeTruthy();
  });
});
