import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescribeIvFluidComponent } from './prescribe-iv-fluid.component';

describe('PrescribeIvFluidComponent', () => {
  let component: PrescribeIvFluidComponent;
  let fixture: ComponentFixture<PrescribeIvFluidComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescribeIvFluidComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescribeIvFluidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
