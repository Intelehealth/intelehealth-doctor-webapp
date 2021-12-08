// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: 'https://testing.visilant.org/openmrs/ws/rest/v1',
  baseURLCoreApp : 'https://testing.visilant.org/openmrs/coreapps/diagnoses',
  baseURLLegacy: 'https://testing.visilant.org/openmrs',
  mindmapURL: 'https://localhost:3004/api',
  azureImage: 'https://testing.visilant.org:3006/api/v1/image'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
