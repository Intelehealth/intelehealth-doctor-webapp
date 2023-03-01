// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base: "https://development.mysmartcaredoc.com/",
  baseURL: "https://development.mysmartcaredoc.com/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://development.mysmartcaredoc.com/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://development.mysmartcaredoc.com/openmrs",
  mindmapURL: "https://development.mysmartcaredoc.com:3004/api",
  notificationURL: "https://development.mysmartcaredoc.com:3004/notification",
  socketURL: "https://development.mysmartcaredoc.com:3004",
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
