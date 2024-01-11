import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrescribeOxytocinComponent } from './prescribe-oxytocin.component';

describe('PrescribeOxytocinComponent', () => {
  let component: PrescribeOxytocinComponent;
  let fixture: ComponentFixture<PrescribeOxytocinComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrescribeOxytocinComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrescribeOxytocinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
