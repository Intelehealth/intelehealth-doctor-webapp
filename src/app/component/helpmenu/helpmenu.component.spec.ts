import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpmenuComponent } from './helpmenu.component';

describe('HelpmenuComponent', () => {
  let component: HelpmenuComponent;
  let fixture: ComponentFixture<HelpmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HelpmenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
