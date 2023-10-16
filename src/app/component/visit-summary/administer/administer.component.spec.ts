import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministerComponent } from './administer.component';

describe('AdministerComponent', () => {
  let component: AdministerComponent;
  let fixture: ComponentFixture<AdministerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdministerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdministerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
