import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastVisitHistoryV4Component } from './past-visit-history-v4.component';

describe('PastVisitHistoryV4Component', () => {
  let component: PastVisitHistoryV4Component;
  let fixture: ComponentFixture<PastVisitHistoryV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PastVisitHistoryV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastVisitHistoryV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
