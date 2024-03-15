import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HwProfileComponent } from './hw-profile.component';

describe('HwProfileComponent', () => {
  let component: HwProfileComponent;
  let fixture: ComponentFixture<HwProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HwProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HwProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
