import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AillmtxTestComponent } from './aillmtx-test.component';

describe('AillmtxTestComponent', () => {
  let component: AillmtxTestComponent;
  let fixture: ComponentFixture<AillmtxTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AillmtxTestComponent]
    });
    fixture = TestBed.createComponent(AillmtxTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
