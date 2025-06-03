import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AillmtxReferralComponent } from './aillmtx-referral.component';

describe('AillmtxReferralComponent', () => {
  let component: AillmtxReferralComponent;
  let fixture: ComponentFixture<AillmtxReferralComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AillmtxReferralComponent]
    });
    fixture = TestBed.createComponent(AillmtxReferralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
