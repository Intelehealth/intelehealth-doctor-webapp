// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://service.sila.care/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://service.sila.care/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://service.sila.care/openmrs",
  mindmapURL: "https://service.sila.care:3004/api",
  notificationURL: "https://service.sila.care:3004/notification",
  socketURL: "https://service.sila.care:3004",
  version:"SYR-v1.1.2",
  versionCode:"9"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
