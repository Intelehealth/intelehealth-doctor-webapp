// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base: "https://ezazi.intelehealth.org",
  baseURL: "https://ezazi.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://ezazi.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://ezazi.intelehealth.org/openmrs",
  mindmapURL: "https://ezazi.intelehealth.org:3004/api",
  notificationURL: "https://ezazi.intelehealth.org:3004/notification",
  socketURL: "https://ezazi.intelehealth.org:3004",
  captchaSiteKey: "6LeNZvklAAAAABQO-10y2egkCxjVOnXxswDSWL8m",
  siteKey: "6LeNZvklAAAAABQO-10y2egkCxjVOnXxswDSWL8m",
  externalPrescriptionCred: 'c3lzbnVyc2U6SUhOdXJzZSMx',
  vapidPublicKey: "BLDLmm1FrOhRJsumFL3lZ8fgnC_c1rFoNp-mz6KWObQpgPkhWzUh66GCGPzioTWBc4u0SB8P4spimU8SH2eWNfg",
  webrtcSdkServerUrl: "wss://ezazi.intelehealth.org:9090",
  webrtcTokenServerUrl: 'https://ezazi.intelehealth.org:3000/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
