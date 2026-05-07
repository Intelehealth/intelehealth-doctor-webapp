

import { envConfig, Client } from './environment.generated';

const CLIENT = envConfig.client as Client;

const URLS: Record<Client, string> = {
  ezazi: envConfig.ezaziBaseUrl,
  nepal: envConfig.nepalBaseUrl,
};

const CAPTCHA_KEYS: Record<Client, { captchaSiteKey: string; siteKey: string }> = {
  ezazi: {
    captchaSiteKey: envConfig.ezaziCaptchaSiteKey,
    siteKey: envConfig.ezaziCaptchaSiteKey,
  },
  nepal: {
    captchaSiteKey: envConfig.nepalCaptchaSiteKey,
    siteKey: envConfig.nepalCaptchaSiteKey,
  },
};

const base = URLS[CLIENT];
const { captchaSiteKey, siteKey } = CAPTCHA_KEYS[CLIENT];

export const environment = {
  production: false,
  client: CLIENT,
  hasStage3: CLIENT === 'nepal',
  base,
  baseURL:         `${base}/openmrs/ws/rest/v1`,
  baseURLCoreApp:  `${base}/openmrs/coreapps/diagnoses`,
  baseURLLegacy:   `${base}/openmrs`,
  mindmapURL:      `${base}:3004/api`,
  notificationURL: `${base}:3004/notification`,
  socketURL:       `${base}:3004`,
  gatewayURL:      `${base}:3030/`,
  webrtcSdkServerUrl:   `wss://${new URL(base).hostname}:9090`,
  webrtcTokenServerUrl: `${base}:3000/`,
  captchaSiteKey,
  siteKey,
  externalPrescriptionCred: envConfig.externalPrescriptionCred,
  vapidPublicKey: envConfig.vapidPublicKey,
  recordsPerPage: envConfig.recordsPerPage,
};
