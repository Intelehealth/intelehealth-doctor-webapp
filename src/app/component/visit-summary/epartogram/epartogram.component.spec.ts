import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EpartogramComponent } from './epartogram.component';

describe('EpartogramComponent', () => {
  let component: EpartogramComponent;
  let fixture: ComponentFixture<EpartogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EpartogramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EpartogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
