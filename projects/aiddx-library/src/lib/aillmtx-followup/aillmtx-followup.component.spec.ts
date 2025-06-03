import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AillmtxFollowupComponent } from './aillmtx-followup.component';

describe('AillmtxFollowupComponent', () => {
  let component: AillmtxFollowupComponent;
  let fixture: ComponentFixture<AillmtxFollowupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AillmtxFollowupComponent]
    });
    fixture = TestBed.createComponent(AillmtxFollowupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
