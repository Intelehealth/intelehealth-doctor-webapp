import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupFormComponent } from './popup-form.component';

describe('PopupFormComponent', () => {
  let component: PopupFormComponent;
  let fixture: ComponentFixture<PopupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
