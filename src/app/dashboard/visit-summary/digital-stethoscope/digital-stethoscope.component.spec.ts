import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalStethoscopeComponent } from './digital-stethoscope.component';

describe('DigitalStethoscopeComponent', () => {
  let component: DigitalStethoscopeComponent;
  let fixture: ComponentFixture<DigitalStethoscopeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DigitalStethoscopeComponent]
    });
    fixture = TestBed.createComponent(DigitalStethoscopeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
