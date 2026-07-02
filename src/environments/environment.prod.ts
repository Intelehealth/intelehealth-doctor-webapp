import { envConfig, Client } from './environment.generated';

const HOSTNAME = window.location.hostname.toLowerCase();
const CLIENT: Client = HOSTNAME.includes('nepalezazi') ? 'nepal' : 'ezazi';

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

const { captchaSiteKey, siteKey } = CAPTCHA_KEYS[CLIENT];

export const environment = {
  production: true,
  client: CLIENT,
  hasStage3: CLIENT === 'nepal',

  forceEzaziBranding: false,
  base:            `${window.location.protocol}//${window.location.host}`,
  baseURL:         `${window.location.protocol}//${window.location.host}/openmrs/ws/rest/v1`,
  baseURLCoreApp:  `${window.location.protocol}//${window.location.host}/openmrs/coreapps/diagnoses`,
  baseURLLegacy:   `${window.location.protocol}//${window.location.host}/openmrs`,
  mindmapURL:      `${window.location.protocol}//${window.location.hostname}:3004/api`,
  notificationURL: `${window.location.protocol}//${window.location.hostname}:3004/notification`,
  socketURL:       `${window.location.protocol}//${window.location.hostname}:3004`,
  gatewayURL:      `${window.location.protocol}//${window.location.hostname}:3030/`,
  webrtcSdkServerUrl:   `wss://${window.location.hostname}:9090`,
  webrtcTokenServerUrl: `${window.location.protocol}//${window.location.hostname}:3000/`,
  captchaSiteKey,
  siteKey,
  externalPrescriptionCred: envConfig.externalPrescriptionCred,
  vapidPublicKey: envConfig.vapidPublicKey,
  recordsPerPage: envConfig.recordsPerPage,
};
