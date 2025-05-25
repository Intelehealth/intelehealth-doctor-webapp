import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AillmtxAdviceComponent } from './aillmtx-advice.component';

describe('AillmtxAdviceComponent', () => {
  let component: AillmtxAdviceComponent;
  let fixture: ComponentFixture<AillmtxAdviceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AillmtxAdviceComponent]
    });
    fixture = TestBed.createComponent(AillmtxAdviceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
