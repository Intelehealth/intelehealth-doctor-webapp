// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

// ─── Change this one line to switch between clients locally ───────────────────
const CLIENT = 'ezazi' as 'ezazi' | 'nepal';
// ─────────────────────────────────────────────────────────────────────────────

const URLS = {
  ezazi: 'https://testezazi.intelehealth.org',
  nepal: 'https://testnepal.intelehealth.org', // TODO: replace with real Nepal URL
};

const base = URLS[CLIENT];

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
  captchaSiteKey: "6LelRWAsAAAAAD-RkHB_lT9OT19I5ClAIHQzen7O",
  siteKey:        "6LelRWAsAAAAAD-RkHB_lT9OT19I5ClAIHQzen7O",
  externalPrescriptionCred: 'ZXh0ZXJuYWxwcmVzdXNlcjpJSFVzZXIjMQ==',
  vapidPublicKey: "BM4tUVW1UwkMpfAWh2mwhA-wwdIC2rCF1MFypbFpjn23qYMQXaeAaYi6ydGslRb_Vdr2Ws0MW5RSUH9InEbYNhA",
  recordsPerPage: 50
};
