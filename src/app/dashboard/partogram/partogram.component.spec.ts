import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartogramComponent } from './partogram.component';

describe('PartogramComponent', () => {
  let component: PartogramComponent;
  let fixture: ComponentFixture<PartogramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PartogramComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
