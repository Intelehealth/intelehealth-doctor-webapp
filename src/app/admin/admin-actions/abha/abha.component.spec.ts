import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbhaComponent } from './abha.component';
import { HttpClient, } from '@angular/common/http';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { HttpLoaderFactory } from '../../admin.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { mockTranslateService } from 'mocks/services/translate.service.mock';
import { mockPageTitleService } from 'mocks/services/page.service.mock';
import { configService as mockConfigService } from 'mocks/services/config.service.mock';
import { ConfigService } from 'src/app/services/config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { mockFeatureResponse } from 'mocks/data/webrtc';

describe('AbhaComponent', () => {
  let component: AbhaComponent;
  let fixture: ComponentFixture<AbhaComponent>;

  beforeEach(() => {
    mockConfigService.getFeatures.and.returnValue(of(mockFeatureResponse))
    mockConfigService.updateWebrtcEnabledStatus.and.returnValue(of({}))
    TestBed.configureTestingModule({
      declarations: [AbhaComponent]
    });
    fixture = TestBed.createComponent(AbhaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
