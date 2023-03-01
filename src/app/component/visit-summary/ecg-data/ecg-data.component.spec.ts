import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EcgDataComponent } from './ecg-data.component';

describe('EcgDataComponent', () => {
  let component: EcgDataComponent;
  let fixture: ComponentFixture<EcgDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EcgDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EcgDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
