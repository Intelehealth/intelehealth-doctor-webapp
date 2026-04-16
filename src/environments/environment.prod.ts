// ─── Change this one line before building for a client ──────────────────────
const CLIENT = 'ezazi' as 'ezazi' | 'nepal';
// ─────────────────────────────────────────────────────────────────────────────

export const environment = {
  production: true,
  client: CLIENT,
  forceNepaliCalendar: false,
  hasStage3: CLIENT === 'nepal',
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
  captchaSiteKey: "6LelRWAsAAAAAD-RkHB_lT9OT19I5ClAIHQzen7O",
  siteKey:        "6LelRWAsAAAAAD-RkHB_lT9OT19I5ClAIHQzen7O",
  externalPrescriptionCred: 'ZXh0ZXJuYWxwcmVzdXNlcjpJSFVzZXIjMQ==',
  vapidPublicKey: "BM4tUVW1UwkMpfAWh2mwhA-wwdIC2rCF1MFypbFpjn23qYMQXaeAaYi6ydGslRb_Vdr2Ws0MW5RSUH9InEbYNhA",
  recordsPerPage: 50
};
