import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitCareContextComponent } from './visit-care-context.component';

describe('VisitCareContextComponent', () => {
  let component: VisitCareContextComponent;
  let fixture: ComponentFixture<VisitCareContextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisitCareContextComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisitCareContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
