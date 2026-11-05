import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { CoreService } from 'src/app/services/core/core.service';
import { AppConfigService } from 'src/app/services/app-config.service';
import { VoicedocRecorderService, VoicedocRecorderState } from 'src/app/services/voicedoc-recorder.service';
import { isVoiceTranscriptEnabled } from 'src/app/utils/voice-transcript';
import { VisitSummaryV2Service } from '../visit-summary-v2.service';
import { KaleyraCallContext } from '../visit-summary-v2.models';

export type KaleyraRecorderPhase = 'ready' | 'recording' | 'paused';

@Component({
  selector: 'app-kaleyra-call-recorder',
  templateUrl: './kaleyra-call-recorder.component.html',
  styleUrls: ['./kaleyra-call-recorder.component.scss'],
  providers: [VoicedocRecorderService]
})
export class KaleyraCallRecorderComponent implements OnInit, OnDestroy {
  call: KaleyraCallContext | null = null;
  phase: KaleyraRecorderPhase = 'ready';
  elapsedSec = 0;
  stopping = false;
  private timer: any = null;
  private subs = new Subscription();

  constructor(
    private v2Service: VisitSummaryV2Service,
    private recorder: VoicedocRecorderService,
    private appConfigService: AppConfigService,
    private coreService: CoreService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.subs.add(this.v2Service.kaleyraCallStarted$.subscribe(call => this.onCallStarted(call)));
    this.subs.add(this.recorder.state$.subscribe(state => this.onRecorderState(state)));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.clearTimer();
    this.recorder.stop();
  }

  get elapsedLabel(): string {
    const minutes = Math.floor(this.elapsedSec / 60);
    const seconds = this.elapsedSec % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  start(): void {
    if (!this.call || this.phase !== 'ready') return;
    this.elapsedSec = 0;
    this.recorder.start({
      visitUuid: this.call.visitUuid,
      patientUuid: this.call.patientUuid,
      doctorUuid: this.call.doctorUuid,
      chwUuid: this.call.chwUuid
    }, 'mic');
  }

  pause(): void {
    this.recorder.pause();
  }

  resume(): void {
    this.recorder.resume();
  }

  confirmStop(): void {
    if (this.phase === 'ready' || this.stopping) return;
    this.coreService.openConfirmationDialog({
      confirmationMsg: 'Stop recording this call? The recording will be sent for transcription and cannot be resumed.',
      cancelBtnText: 'Cancel',
      confirmBtnText: 'Stop recording'
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed || this.phase === 'ready') return;
      this.stopping = true;
      this.recorder.stop().then(() => {
        this.stopping = false;
        this.close();
        this.toastr.success('Recording stopped. The transcript will be ready shortly.');
      });
    });
  }

  dismiss(): void {
    if (this.phase === 'ready') this.close();
  }

  private onCallStarted(call: KaleyraCallContext): void {
    if (!isVoiceTranscriptEnabled(this.appConfigService, 'webapp')) return;
    if (this.phase !== 'ready' || this.stopping) return;
    this.call = call;
  }

  private onRecorderState(state: VoicedocRecorderState): void {
    if (state === 'recording' || state === 'paused') {
      this.phase = state;
      this.startTimer();
      return;
    }
    this.clearTimer();
    if (state === 'disabled') {
      this.recorder.stop();
      this.close();
      this.toastr.error('Call recording is turned off. Contact your administrator.');
    } else if (state === 'error') {
      this.phase = 'ready';
      this.toastr.error('Microphone is not available. Allow microphone access to record the call.');
    }
  }

  private close(): void {
    this.clearTimer();
    this.call = null;
    this.phase = 'ready';
    this.elapsedSec = 0;
  }

  private startTimer(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      if (this.phase === 'recording') this.elapsedSec++;
    }, 1000);
  }

  private clearTimer(): void {
    clearInterval(this.timer);
    this.timer = null;
  }
}
