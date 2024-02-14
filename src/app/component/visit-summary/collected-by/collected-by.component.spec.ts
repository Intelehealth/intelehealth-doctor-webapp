import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectedByComponent } from './collected-by.component';

describe('CollectedByComponent', () => {
  let component: CollectedByComponent;
  let fixture: ComponentFixture<CollectedByComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CollectedByComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectedByComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
