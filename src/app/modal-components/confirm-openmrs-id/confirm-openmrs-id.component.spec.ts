import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmOpenmrsIdComponent } from './confirm-openmrs-id.component';

describe('ConfirmOpenmrsIdComponent', () => {
  let component: ConfirmOpenmrsIdComponent;
  let fixture: ComponentFixture<ConfirmOpenmrsIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmOpenmrsIdComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmOpenmrsIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
