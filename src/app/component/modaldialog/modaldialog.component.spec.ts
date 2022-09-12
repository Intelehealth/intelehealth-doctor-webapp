import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModaldialogComponent } from './modaldialog.component';

describe('ModaldialogComponent', () => {
  let component: ModaldialogComponent;
  let fixture: ComponentFixture<ModaldialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModaldialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModaldialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
