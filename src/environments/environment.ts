// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://trn.digitalhih.net/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://trn.digitalhih.net/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://trn.digitalhih.net/openmrs",
  mindmapURL: "https://trn.digitalhih.net:3004/api",
  notificationURL: "https://trn.digitalhih.net:3004/notification",
  socketURL: "https://trn.digitalhih.net:3004",
  tempToken: "c3lzbnVyc2U6SUhOdXJzZSMx",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
