import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaiseTicketComponent } from './raise-ticket.component';

describe('RaiseTicketComponent', () => {
  let component: RaiseTicketComponent;
  let fixture: ComponentFixture<RaiseTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaiseTicketComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaiseTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
