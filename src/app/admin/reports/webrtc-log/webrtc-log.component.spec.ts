import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebrtcLogComponent } from './webrtc-log.component';

describe('WebrtcLogComponent', () => {
  let component: WebrtcLogComponent;
  let fixture: ComponentFixture<WebrtcLogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebrtcLogComponent]
    });
    fixture = TestBed.createComponent(WebrtcLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
