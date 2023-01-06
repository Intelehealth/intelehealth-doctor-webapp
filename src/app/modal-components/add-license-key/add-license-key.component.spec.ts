import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLicenseKeyComponent } from './add-license-key.component';

describe('AddLicenseKeyComponent', () => {
  let component: AddLicenseKeyComponent;
  let fixture: ComponentFixture<AddLicenseKeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddLicenseKeyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLicenseKeyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
