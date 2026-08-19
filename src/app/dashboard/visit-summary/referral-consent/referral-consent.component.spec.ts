import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralConsentComponent } from './referral-consent.component';

describe('ReferralConsentComponent', () => {
  let component: ReferralConsentComponent;
  let fixture: ComponentFixture<ReferralConsentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReferralConsentComponent]
    });
    fixture = TestBed.createComponent(ReferralConsentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
