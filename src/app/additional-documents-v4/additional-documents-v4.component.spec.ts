import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalDocumentsV4Component } from './additional-documents-v4.component';

describe('AdditionalDocumentsV4Component', () => {
  let component: AdditionalDocumentsV4Component;
  let fixture: ComponentFixture<AdditionalDocumentsV4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalDocumentsV4Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdditionalDocumentsV4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
