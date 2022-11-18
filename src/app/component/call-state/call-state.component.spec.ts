import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallStateComponent } from './call-state.component';

describe('CallStateComponent', () => {
  let component: CallStateComponent;
  let fixture: ComponentFixture<CallStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CallStateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
