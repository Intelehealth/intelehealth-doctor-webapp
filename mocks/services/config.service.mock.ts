/// <reference types="jasmine" />

import { mockWebrtcResponse } from "mocks/data/webrtc";
import { of } from "rxjs";
import { ConfigService } from "src/app/services/config.service";


const configService = jasmine.createSpyObj<ConfigService>('configService', [
    'updateFeatureEnabledStatus',
    'updateWebrtcEnabledStatus',
    'getWebrtcs',
    'getFeatures',
    'getFeatureByKey',
    'publishConfig'
]);

configService.publishConfig.and.returnValue(of({}));

configService.getWebrtcs.and.returnValue(of(mockWebrtcResponse))

configService.getFeatureByKey.and.returnValue(of({ feature: { id: 1, key: 'namco_referral_section', name: 'Namco Referral Section', is_enabled: true } }))

export { configService };