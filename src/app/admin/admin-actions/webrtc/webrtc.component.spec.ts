import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebrtcComponent } from './webrtc.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ConfigService } from 'src/app/services/config.service';
import { of } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { PageTitleService } from 'src/app/core/page-title/page-title.service';
import { ToastrModule } from 'ngx-toastr';
import { HttpLoaderFactory } from '../../admin.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { mockTranslateService } from 'src/mocks/translate.service';
import { mockPageTitleService } from 'src/mocks/page.service';
import { MatTableModule } from '@angular/material/table';
import { By } from '@angular/platform-browser';

const mockResponse = {
  webrtc: {
    webrtc_section: {
      id: 1,
      name: 'webrtc_section',
      is_enabled: true
    },
    webrtc: [{
      id: 1,
      is_enabled: true,
      name: 'Chat',
      key: 'chat'
    }, {
      id: 2,
      is_enabled: true,
      name: 'Video Call',
      key: 'video_call'
    }]
  }
}
const configService = jasmine.createSpyObj<ConfigService>('configService', ['getWebrtcs', 'updateWebrtcEnabledStatus'])
const mockConfigService = {
  'getWebrtcs': configService.getWebrtcs.and.returnValue(of(mockResponse)),
  'updateWebrtcEnabledStatus': configService.updateWebrtcEnabledStatus.withArgs(1, false).and.returnValue(of(mockResponse))
}

describe('WebrtcComponent', () => {
  let component: WebrtcComponent;
  let fixture: ComponentFixture<WebrtcComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WebrtcComponent],
      imports: [
        HttpClientModule,
        MatPaginatorModule,
        MatTableModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        }),
        ToastrModule.forRoot({
          positionClass: 'toast-bottom-right',
          preventDuplicates: true,
          closeButton: true,
          tapToDismiss: false
        })
      ],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: PageTitleService, useValue: mockPageTitleService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(WebrtcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call the getWebrtcs method', () => {
    expect(mockConfigService.getWebrtcs).toHaveBeenCalled();
    expect(component.webrtcData).toEqual(mockResponse.webrtc)
    expect(component.webrtcData?.webrtc_section?.is_enabled).toEqual(true)
  });

  it('should call the updateStatus method', () => {
    spyOn(component, 'updateStatus');
    const updateResponse = { ...mockResponse }
    updateResponse.webrtc.webrtc[0].is_enabled = false;
    mockConfigService.getWebrtcs.and.returnValue(of(mockResponse))
    fixture.detectChanges();
    const toggleCheckbox = fixture.debugElement.query(By.css('.card-body .pretty.p-switch input[type="checkbox"]'));
    toggleCheckbox.triggerEventHandler('change', {
      "target": {
        'checked': false
      }
    })
    fixture.detectChanges();
    expect(toggleCheckbox).toBeDefined();
    expect(component.updateStatus).toHaveBeenCalled();
    // expect(mockConfigService.updateWebrtcEnabledStatus).toHaveBeenCalled();
    expect(component.webrtcData?.webrtc?.[0]?.is_enabled).toEqual(false)
    expect(component.webrtcData).toEqual(mockResponse.webrtc)
  });
});
