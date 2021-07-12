import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PastHistoryComponent } from './past-history.component';

describe('PastHistoryComponent', () => {
  let component: PastHistoryComponent;
  let fixture: ComponentFixture<PastHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PastHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PastHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
