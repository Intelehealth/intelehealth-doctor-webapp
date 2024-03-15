import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AyuComponent } from './ayu.component';

describe('AyuComponent', () => {
  let component: AyuComponent;
  let fixture: ComponentFixture<AyuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AyuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AyuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
