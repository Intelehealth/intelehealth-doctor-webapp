import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ConfigService } from 'src/app/services/config.service';
import { AiLlmComponent } from './ai-llm.component';

describe('AiLlmComponent', () => {
  let component: AiLlmComponent;
  let fixture: ComponentFixture<AiLlmComponent>;
  let router: jasmine.SpyObj<Router>;
  let configService: jasmine.SpyObj<ConfigService>;

  const voiceTranscriptRows = [
    { id: 1, key: 'record_transcribe_webapp', name: 'Record & transcribe calls (Doctor webapp)', is_enabled: true },
    { id: 2, key: 'record_transcribe_mobile', name: 'Record & transcribe calls (Mobile)', is_enabled: false },
    { id: 3, key: 'feed_ai_ddx', name: 'Feed AI DDx', is_enabled: false },
    { id: 4, key: 'autofill_doctor_notes', name: 'Autofill doctor notes', is_enabled: false }
  ];

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    configService = jasmine.createSpyObj<ConfigService>('ConfigService', [
      'getAILLM', 'getAILLMByKey', 'getAILLMRecording', 'getAILLMRecordingByKey',
      'getAILLMVoiceTranscript', 'getAILLMVoiceTranscriptByKey', 'updateAILLMVoiceTranscriptEnabledStatus',
      'updateFeatureEnabledStatus', 'publishConfig'
    ]);
    configService.getAILLM.and.returnValue(of({ aiLlm: [] }));
    configService.getAILLMRecording.and.returnValue(of({ aiLlm: [] }));
    configService.getAILLMVoiceTranscript.and.returnValue(of({ aiLlm: voiceTranscriptRows }));
    configService.getAILLMByKey.and.returnValue(of({ feature: { id: 10, is_enabled: true } }));
    configService.getAILLMRecordingByKey.and.returnValue(of({ feature: { id: 11, is_enabled: true } }));
    configService.getAILLMVoiceTranscriptByKey.and.returnValue(of({ feature: { id: 12, is_enabled: false } }));
    configService.updateFeatureEnabledStatus.and.returnValue(of({}));
    configService.updateAILLMVoiceTranscriptEnabledStatus.and.returnValue(of({}));

    TestBed.configureTestingModule({
      declarations: [AiLlmComponent],
      imports: [FormsModule, MatTableModule, MatPaginatorModule, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        { provide: ConfigService, useValue: configService },
        { provide: Router, useValue: router },
        { provide: ToastrService, useValue: { success: () => {} } },
        { provide: PageTitleService, useValue: { setTitle: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    spyOn(TestBed.inject(TranslateService), 'use').and.returnValue(of({}));
    fixture = TestBed.createComponent(AiLlmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads the voice transcript flags and master feature', () => {
    expect(configService.getAILLMVoiceTranscriptByKey).toHaveBeenCalledWith('ai_llm_voice_transcript_section');
    expect(component.aiLlmVoiceTranscriptId).toBe(12);
    expect(component.aiLlmVoiceTranscriptDataSource.data.length).toBe(4);
  });

  it('shows the View link only on the doctor webapp record & transcribe row', () => {
    const links = fixture.nativeElement.querySelectorAll('[data-test-id^="linkViewVoiceTranscripts-"]');
    expect(Array.from(links).map((el: HTMLElement) => el.getAttribute('data-test-id'))).toEqual([
      'linkViewVoiceTranscripts-webapp'
    ]);
  });

  it('navigates to the transcripts list with the row source', () => {
    fixture.nativeElement.querySelector('[data-test-id="linkViewVoiceTranscripts-webapp"]').click();
    expect(router.navigate).toHaveBeenCalledWith(['/admin/actions/ai-llm/voice-transcripts'], { queryParams: { source: 'webapp' } });
  });

  it('toggles the master feature and sub-flags through the config service', () => {
    component.updateAILLMVoiceTranscriptStatus(true);
    expect(configService.updateFeatureEnabledStatus).toHaveBeenCalledWith(12, true);
    component.updateAILLMVoiceTranscriptEnabledStatus(2, true);
    expect(configService.updateAILLMVoiceTranscriptEnabledStatus).toHaveBeenCalledWith(2, true);
  });
});
