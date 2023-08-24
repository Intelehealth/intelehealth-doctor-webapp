// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  base: "https://demo.intelehealth.org",
  baseURL: "https://demo.intelehealth.org/openmrs/ws/rest/v1",
  baseURLCoreApp: "https://demo.intelehealth.org/openmrs/coreapps/diagnoses",
  baseURLLegacy: "https://demo.intelehealth.org/openmrs",
  mindmapURL: "https://demo.intelehealth.org:3004/api",
  notificationURL: "https://demo.intelehealth.org:3004/notification",
  socketURL: "https://demo.intelehealth.org:3004",
  captchaSiteKey: "6LdlqHUnAAAAACqzNZV6ucCuLkrRo-cKF1jCkeoc",
  firebase: {
    /* apiKey: "AIzaSyC5cRqdDtLWwJpz7WY1Ekpx7rbawbG1CA8",
    authDomain: "intelehealth-3-0.firebaseapp.com",
    databaseURL: "https://intelehealth-3-0-default-rtdb.firebaseio.com",
    projectId: "intelehealth-3-0",
    storageBucket: "intelehealth-3-0.appspot.com",
    messagingSenderId: "781318396284",
    appId: "1:781318396284:web:69d37af4daa956a3df6cf9",
    measurementId: "G-68HCCL881X",*/
    apiKey: "AIzaSyDkU15rxve37d9hu_4y0lUNOfrUX6iSpUI",
    authDomain: "intelehealth-webapp.firebaseapp.com",
    projectId: "intelehealth-webapp",
    storageBucket: "intelehealth-webapp.appspot.com",
    messagingSenderId: "246647122371",
    appId: "1:246647122371:web:c45944219d1f37bf30b576",
  },
  webrtcSdkServerUrl: "wss://dev.intelehealth.org:9090",
  webrtcTokenServerUrl: 'https://dev.intelehealth.org:3000/',
  siteKey: "6LdsBpUlAAAAAAqx9zrWBhSj6UqOkDIOw8aQorWx",
  externalPrescriptionCred: 'c3lzbnVyc2U6TnVyc2UxMjM==',
  vapidPublicKey: "BANxSWzoJW3mjQn49eDQRKjtnXCt6F98Df9XrxfDsT71KYKE8LpcW67-OIt1v4lAlm4GWZwjS1OvQBjyJ6r8Z7A",
  authGatwayURL: 'https://dev.intelehealth.org:3030/v2/',
  showCaptcha: true,
  recordsPerPage: 1000
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
