// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://astesting.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://astesting.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://astesting.intelehealth.org/openmrs",
  mindmapURL: "https://astesting.intelehealth.org:3004/api",
  notificationURL: "https://astesting.intelehealth.org:3004/notification",
  socketURL: "https://astesting.intelehealth.org:3004",
  gatewayURL: "https://astesting.intelehealth.org:3030/",
  version: "NAS-v1.3.1",
  versionCode: "28",
  webrtcSdkServerUrl: "wss://astesting.intelehealth.org:9090",
  webrtcTokenServerUrl: "https://astesting.intelehealth.org:3000/"
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
