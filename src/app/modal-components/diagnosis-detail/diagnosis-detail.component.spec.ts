import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiagnosisDetailComponent } from './diagnosis-detail.component';

describe('DiagnosisDetailComponent', () => {
  let component: DiagnosisDetailComponent;
  let fixture: ComponentFixture<DiagnosisDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DiagnosisDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiagnosisDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
