import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternetConnectionComponent } from './internet-connection.component';

describe('InternetConnectionComponent', () => {
  let component: InternetConnectionComponent;
  let fixture: ComponentFixture<InternetConnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InternetConnectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InternetConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
