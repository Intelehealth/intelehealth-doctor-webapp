import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchedPatientsComponent } from './searched-patients.component';

describe('SearchedPatientsComponent', () => {
  let component: SearchedPatientsComponent;
  let fixture: ComponentFixture<SearchedPatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchedPatientsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchedPatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
