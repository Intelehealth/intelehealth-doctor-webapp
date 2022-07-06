import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VctoHwComponent } from './vcto-hw.component';

describe('VctoHwComponent', () => {
  let component: VctoHwComponent;
  let fixture: ComponentFixture<VctoHwComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VctoHwComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VctoHwComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
