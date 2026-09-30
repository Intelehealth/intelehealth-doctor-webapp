import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitSidebarComponent } from './visit-sidebar.component';

describe('VisitSidebarComponent', () => {
  let component: VisitSidebarComponent;
  let fixture: ComponentFixture<VisitSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VisitSidebarComponent]
    });
    fixture = TestBed.createComponent(VisitSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
