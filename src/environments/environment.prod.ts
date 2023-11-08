export const environment = {
  production: true,
  base: `${window.location.protocol}//${window.location.host}`,
  baseURL: `${window.location.protocol}//${window.location.host}/openmrs/ws/rest/v1`,
  baseURLCoreApp: `${window.location.protocol}//${window.location.host}/openmrs/coreapps/diagnoses`,
  baseURLLegacy: `${window.location.protocol}//${window.location.host}/openmrs`,
  mindmapURL: `${window.location.protocol}//${window.location.hostname}:3004/api`,
  notificationURL: `${window.location.protocol}//${window.location.hostname}:3004/notification`,
  socketURL: `${window.location.protocol}//${window.location.hostname}:3004`,
  captchaSiteKey: "6LeNZvklAAAAABQO-10y2egkCxjVOnXxswDSWL8m",
  siteKey: "6LeNZvklAAAAABQO-10y2egkCxjVOnXxswDSWL8m",
  externalPrescriptionCred: 'ZXh0ZXJuYWxwcmVzdXNlcjpJSFVzZXIjMQ==', //externaluser
  vapidPublicKey: "BM4tUVW1UwkMpfAWh2mwhA-wwdIC2rCF1MFypbFpjn23qYMQXaeAaYi6ydGslRb_Vdr2Ws0MW5RSUH9InEbYNhA",
  webrtcSdkServerUrl: `wss://${window.location.hostname}:9090`,
  webrtcTokenServerUrl: `${window.location.protocol}//${window.location.hostname}:3000/`,
  recordsPerPage: 50
};
