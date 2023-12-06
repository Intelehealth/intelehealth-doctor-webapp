// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://as.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://as.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://as.intelehealth.org/openmrs",
  mindmapURL: "https://as.intelehealth.org:3004/api",
  notificationURL: "https://as.intelehealth.org:3004/notification",
  socketURL: "https://as.intelehealth.org:3004",
  version: "NAS-v1.2.9",
  versionCode: "26",
  webrtcSdkServerUrl: "wss://dev.intelehealth.org:9090",
  webrtcTokenServerUrl: "https://dev.intelehealth.org:3000/"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
