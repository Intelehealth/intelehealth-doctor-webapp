import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EndedVisitsComponent } from './ended-visits.component';

describe('EndedVisitsComponent', () => {
  let component: EndedVisitsComponent;
  let fixture: ComponentFixture<EndedVisitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndedVisitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndedVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
