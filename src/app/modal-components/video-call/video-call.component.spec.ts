import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoCallComponent } from './video-call.component';
import { VoicedocRecorderService } from 'src/app/services/voicedoc-recorder.service';

describe('VideoCallComponent', () => {
  let component: VideoCallComponent;
  let fixture: ComponentFixture<VideoCallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VideoCallComponent ],
      providers: [
        { provide: VoicedocRecorderService, useValue: { start: () => Promise.resolve(), stop: () => Promise.resolve() } }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
