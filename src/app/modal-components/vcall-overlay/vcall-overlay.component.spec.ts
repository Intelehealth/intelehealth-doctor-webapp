import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VcallOverlayComponent } from './vcall-overlay.component';

describe('VcallOverlayComponent', () => {
  let component: VcallOverlayComponent;
  let fixture: ComponentFixture<VcallOverlayComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VcallOverlayComponent]
    });
    fixture = TestBed.createComponent(VcallOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
