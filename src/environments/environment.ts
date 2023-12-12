// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://testing.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://testing.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://testing.intelehealth.org/openmrs",
  mindmapURL: "https://testing.intelehealth.org:3004/api",
  notificationURL: "https://testing.intelehealth.org:3004/notification",
  socketURL: "https://testing.intelehealth.org:3004",
  version: "NAS-v1.2.9",
  versionCode: "26",
  webrtcSdkServerUrl: "wss://testing.intelehealth.org:9090",
  webrtcTokenServerUrl: "https://testing.intelehealth.org:3000/"
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
