import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorNoteComponent } from './doctor-note.component';

describe('DoctorNoteComponent', () => {
  let component: DoctorNoteComponent;
  let fixture: ComponentFixture<DoctorNoteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DoctorNoteComponent]
    });
    fixture = TestBed.createComponent(DoctorNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('DoctorNoteComponent AI section flags', () => {
  const build = (aiLlm: any) =>
    new DoctorNoteComponent({ isMCCUser: () => false } as any, null, null, null, { ai_llm: aiLlm } as any);

  const cases: [string, string][] = [
    ['showAiAdvice', 'ai_ttx_advice'],
    ['showAiTests', 'ai_ttx_investigation'],
    ['showAiReferral', 'ai_ttx_referral'],
    ['showAiFollowUp', 'ai_ttx_followup']
  ];

  cases.forEach(([getter, key]) => {
    it(`${getter} is OFF when key is missing`, () => {
      expect(build({})[getter]).toBe(false);
      expect(build(undefined)[getter]).toBe(false);
    });

    it(`${getter} is ON when ${key} is true`, () => {
      expect(build({ [key]: true })[getter]).toBe(true);
    });

    it(`${getter} is OFF when ${key} is false`, () => {
      expect(build({ [key]: false })[getter]).toBe(false);
    });
  });
});
