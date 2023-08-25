import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReassignSpecialityComponent } from './reassign-speciality.component';

describe('ReassignSpecialityComponent', () => {
  let component: ReassignSpecialityComponent;
  let fixture: ComponentFixture<ReassignSpecialityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ReassignSpecialityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReassignSpecialityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
