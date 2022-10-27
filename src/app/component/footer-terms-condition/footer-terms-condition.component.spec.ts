import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterTermsConditionComponent } from './footer-terms-condition.component';

describe('FooterTermsConditionComponent', () => {
  let component: FooterTermsConditionComponent;
  let fixture: ComponentFixture<FooterTermsConditionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FooterTermsConditionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FooterTermsConditionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
