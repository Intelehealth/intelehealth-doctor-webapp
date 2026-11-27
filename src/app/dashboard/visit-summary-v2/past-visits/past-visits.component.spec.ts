import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastVisitsComponent } from './past-visits.component';

describe('PastVisitsComponent', () => {
  let component: PastVisitsComponent;
  let fixture: ComponentFixture<PastVisitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PastVisitsComponent]
    });
    fixture = TestBed.createComponent(PastVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
