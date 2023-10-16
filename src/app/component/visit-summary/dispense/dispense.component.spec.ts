import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DispenseComponent } from './dispense.component';

describe('DispenseComponent', () => {
  let component: DispenseComponent;
  let fixture: ComponentFixture<DispenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DispenseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DispenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
