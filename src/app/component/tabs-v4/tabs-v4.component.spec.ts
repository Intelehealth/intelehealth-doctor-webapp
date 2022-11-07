import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabsV4Component } from './tabs-v4.component';

describe('TabsV4Component', () => {
  let component: TabsV4Component;
  let fixture: ComponentFixture<TabsV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TabsV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TabsV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
