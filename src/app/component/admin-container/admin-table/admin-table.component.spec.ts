import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTableComponent } from './admin-table.component';

describe('AdminTableComponent', () => {
  let component: AdminTableComponent;
  let fixture: ComponentFixture<AdminTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
