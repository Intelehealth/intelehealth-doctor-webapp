// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseURL: "https://demo.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://demo.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://demo.intelehealth.org/openmrs",
  mindmapURL: "https://demo.intelehealth.org:3004/api",
  notificationURL: "https://demo.intelehealth.org:3004/notification",
  socketURL: "https://demo.intelehealth.org:3004",
  firebase: {
    // add IDA firebase key for phone below is the temporary key we have created
    apiKey: "AIzaSyDkU15rxve37d9hu_4y0lUNOfrUX6iSpUI",
    authDomain: "intelehealth-webapp.firebaseapp.com",
    projectId: "intelehealth-webapp",
    storageBucket: "intelehealth-webapp.appspot.com",
    messagingSenderId: "246647122371",
    appId: "1:246647122371:web:c45944219d1f37bf30b576",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
