import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatformFieldsSelectonComponent } from './platform-fields-selecton.component';

describe('PlatformFieldsSelectonComponent', () => {
  let component: PlatformFieldsSelectonComponent;
  let fixture: ComponentFixture<PlatformFieldsSelectonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlatformFieldsSelectonComponent]
    });
    fixture = TestBed.createComponent(PlatformFieldsSelectonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
