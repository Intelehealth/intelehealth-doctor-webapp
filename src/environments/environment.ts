// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base: "https://devezazi.intelehealth.org",
  baseURL: "https://devezazi.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://devezazi.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://devezazi.intelehealth.org/openmrs",
  mindmapURL: "https://devezazi.intelehealth.org:3004/api",
  notificationURL: "https://devezazi.intelehealth.org:3004/notification",
  socketURL: "https://devezazi.intelehealth.org:3004",
  captchaSiteKey: "6LeNZvklAAAAABQO-10y2egkCxjVOnXxswDSWL8m",
  siteKey: "6LeNZvklAAAAABQO-10y2egkCxjVOnXxswDSWL8m",
  externalPrescriptionCred: 'ZXh0ZXJuYWxwcmVzdXNlcjpJSFVzZXIjMQ==', //externaluser
  vapidPublicKey: "BM4tUVW1UwkMpfAWh2mwhA-wwdIC2rCF1MFypbFpjn23qYMQXaeAaYi6ydGslRb_Vdr2Ws0MW5RSUH9InEbYNhA",
  webrtcSdkServerUrl: "wss://devezazi.intelehealth.org:9090",
  webrtcTokenServerUrl: 'https://devezazi.intelehealth.org:3000/',
  recordsPerPage: 50
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
