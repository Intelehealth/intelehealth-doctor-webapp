import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DietTypeComponent } from './diet-type.component';

describe('DietTypeComponent', () => {
  let component: DietTypeComponent;
  let fixture: ComponentFixture<DietTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DietTypeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DietTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
