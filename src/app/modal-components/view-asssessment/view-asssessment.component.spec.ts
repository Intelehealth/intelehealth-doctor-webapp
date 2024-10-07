import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAsssessmentComponent } from './view-asssessment.component';

describe('ViewAsssessmentComponent', () => {
  let component: ViewAsssessmentComponent;
  let fixture: ComponentFixture<ViewAsssessmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewAsssessmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewAsssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
