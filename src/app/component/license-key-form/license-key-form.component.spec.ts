import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LicenseKeyFormComponent } from './license-key-form.component';

describe('LicenseKeyFormComponent', () => {
  let component: LicenseKeyFormComponent;
  let fixture: ComponentFixture<LicenseKeyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LicenseKeyFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LicenseKeyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
