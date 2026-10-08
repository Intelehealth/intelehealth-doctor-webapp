import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguageFieldUpdate } from './language-fields-update.component';

describe('LanguageFieldUpdate', () => {
  let component: LanguageFieldUpdate;
  let fixture: ComponentFixture<LanguageFieldUpdate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LanguageFieldUpdate ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LanguageFieldUpdate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
