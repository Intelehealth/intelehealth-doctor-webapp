import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitExternalFacilitiesComponent } from './visit-external-facilities.component';

describe('VisitExternalFacilitiesComponent', () => {
  let component: VisitExternalFacilitiesComponent;
  let fixture: ComponentFixture<VisitExternalFacilitiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisitExternalFacilitiesComponent]
    });
    fixture = TestBed.createComponent(VisitExternalFacilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
