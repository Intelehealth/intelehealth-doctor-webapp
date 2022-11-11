import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdviceV4Component } from './advice-v4.component';

describe('AdviceV4Component', () => {
  let component: AdviceV4Component;
  let fixture: ComponentFixture<AdviceV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdviceV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdviceV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
