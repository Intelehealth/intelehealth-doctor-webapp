// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://training.sila.care/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://training.sila.care/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://training.sila.care/openmrs",
  mindmapURL: "https://training.sila.care:3004/api",
  notificationURL: "https://training.sila.care:3004/notification",
  socketURL: "https://training.sila.care:3004",
  webrtcSdkServerUrl: "wss://training.sila.care:9090",
  webrtcTokenServerUrl: 'https://training.sila.care:3000/',
  authSvcUrl: 'https://training.sila.care:3030/',
  version:"SYR-v1.1.2",
  versionCode:"9",
  publicKey: "BJJvSw6ltFPN5GDxIOwbRtJUBBJp2CxftaRNGbntvE0kvzpe05D9zKr-SknKvNBihXDoyd09KuHrWwC3lFlTe54",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
