import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigService } from '../../services/app-config.service';

import { ReferredComponent } from './referred.component';

describe('ReferredComponent', () => {
  let component: ReferredComponent;
  let fixture: ComponentFixture<ReferredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferredComponent ],
      imports: [ HttpClientTestingModule, TranslateModule.forRoot() ],
      // AppConfigService.patient_registration is only populated after an async config
      // fetch that this test doesn't trigger, so it's stubbed out here.
      providers: [
        { provide: AppConfigService, useValue: { patient_registration: {} } }
      ],
      // The Material/table markup isn't relevant to this smoke test.
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
