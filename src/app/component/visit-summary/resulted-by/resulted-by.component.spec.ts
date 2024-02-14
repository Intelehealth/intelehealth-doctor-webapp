import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultedByComponent } from './resulted-by.component';

describe('ResultedByComponent', () => {
  let component: ResultedByComponent;
  let fixture: ComponentFixture<ResultedByComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResultedByComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultedByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
