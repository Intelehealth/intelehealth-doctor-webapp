import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetUpProfileComponent } from './set-up-profile.component';

describe('SetUpProfileComponent', () => {
  let component: SetUpProfileComponent;
  let fixture: ComponentFixture<SetUpProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetUpProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SetUpProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
