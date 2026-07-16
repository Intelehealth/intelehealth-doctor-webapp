import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentVisitDetailsComponent } from './current-visit-details.component';

describe('CurrentVisitDetailsComponent', () => {
  let component: CurrentVisitDetailsComponent;
  let fixture: ComponentFixture<CurrentVisitDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentVisitDetailsComponent]
    });
    fixture = TestBed.createComponent(CurrentVisitDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
