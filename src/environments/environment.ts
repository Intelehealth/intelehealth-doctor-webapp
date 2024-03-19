// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://afitraining.ekalarogya.org/openmrs/ws/rest/v1",
  baseURLCoreApp:
    "https://afitraining.ekalarogya.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://afitraining.ekalarogya.org/openmrs",
  mindmapURL: "https://afitraining.ekalarogya.org:3004/api",
  reportURL: "https://afitraining.ekalarogya.org/gen",
  notificationURL: "https://afitraining.ekalarogya.org:3004/notification",
  socketURL: "https://afitraining.ekalarogya.org:3004",
  webrtcSdkServerUrl: "wss://afitraining.ekalarogya.org:9090",
  webrtcTokenServerUrl: 'https://afitraining.ekalarogya.org:3000/',
  authSvcUrl: 'https://afitraining.ekalarogya.org:3030/',
  version: "AEAT-v1.9.0",
  versionCode: "48",
  vapidKey: "BHkKl1nW4sC_os9IRMGhrSZ4JJp0RHl2_PxTdV_rElOjnHe-dq1hx2zw_bTgrkc4ulFD-VD4x6P63qN1Giroe7U" /** afitrianing */
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
