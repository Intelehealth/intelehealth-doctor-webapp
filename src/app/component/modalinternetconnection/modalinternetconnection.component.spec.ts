import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalinternetconnectionComponent } from './modalinternetconnection.component';

describe('ModalinternetconnectionComponent', () => {
  let component: ModalinternetconnectionComponent;
  let fixture: ComponentFixture<ModalinternetconnectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalinternetconnectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalinternetconnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
