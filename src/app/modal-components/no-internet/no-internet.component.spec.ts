import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoInternetComponent } from './no-internet.component';

describe('NoInternetComponent', () => {
  let component: NoInternetComponent;
  let fixture: ComponentFixture<NoInternetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NoInternetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoInternetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
