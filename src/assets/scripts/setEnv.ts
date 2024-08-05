/* tslint:disable */
// @ts-nocheck
const { writeFile, existsSync, mkdirSync } = require('fs');
const { argv } = require('yargs');

require('dotenv').config();
const environment = argv.environment;


function writeFileUsingFS(targetPath, environmentFileContent) {
  writeFile(targetPath, environmentFileContent, function (err) {
    if (err) {
      console.log(err);
    }
    if (environmentFileContent !== '') {
      console.log(`wrote variables to ${targetPath}`);
    }
  });
}


// Providing path to the `environments` directory
const envDirectory = './src/environments';

// creates the `environments` directory if it does not exist
if (!existsSync(envDirectory)) {
  mkdirSync(envDirectory);
}

//creates the `environment.prod.ts` and `environment.ts` file if it does not exist
writeFileUsingFS('./src/environments/environment.prod.ts', '');
writeFileUsingFS('./src/environments/environment.ts', '');


// Checks whether command line argument of `prod` was provided signifying production mode
const isProduction = environment === 'prod';

// choose the correct targetPath based on the environment chosen
const targetPath = isProduction
  ? './src/environments/environment.prod.ts'
  : './src/environments/environment.ts';

let showCaptcha = process.env.SHOW_CAPTCHA;

if (environment === 'test') {
  showCaptcha = false;
}

//actual content to be compiled dynamically and pasted into respective environment files
const environmentFileContent = `
  // This file was autogenerated by dynamically running setEnv.ts and using dotenv for managing API key secrecy
  export const environment = {
    production: ${isProduction},
    base: '${process.env.BASE}',
    baseURL: '${process.env.BASE_URL}',
    baseURLCoreApp: '${process.env.BASE_URL_CORD_APP}',
    baseURLLegacy: '${process.env.BASE_URL_LEGACY}',
    mindmapURL: '${process.env.MIND_MAP_URL}',
    configURL: '${process.env.CONFIG_URL}',
    abhaURL: '${process.env.ABHA_URL}',
    notificationURL: '${process.env.NOTIFICATION_URL}',
    socketURL: '${process.env.SOCKET_URL}',
    captchaSiteKey: '${process.env.CAPTCHA_SITE_KEY}',
    firebase: {
        apiKey: '${process.env.FIREBASE_API_KEY}',
        authDomain: '${process.env.FIREBASE_AUTH_DOMAIN}',
        projectId: '${process.env.FIREBASE_PROJECT_ID}',
        storageBucket: '${process.env.FIREBASE_STORAGE_BUCKET}',
        messagingSenderId: '${process.env.FIREBASE_MESSAGING_SENDER_ID}',
        appId: '${process.env.FIREBASE_APP_ID}',
    },
    webrtcSdkServerUrl: '${process.env.WEB_RTC_SDK_SERVER_URL}',
    webrtcTokenServerUrl: '${process.env.WEB_RTC_TOKEN_SERVER_URL}',
    siteKey: '${process.env.SITE_KEY}',
    externalPrescriptionCred: '${process.env.EXTERNAL_PRESCRIPTION_CRED}',
    vapidPublicKey: '${process.env.VAPID_PUBLIC_KEY}',
    authGatwayURL: '${process.env.AUTH_GATE_WAY_URL}',
    showCaptcha: ${showCaptcha},
    recordsPerPage: 1000,
    abhaEnabled: ${process.env.ABHA_ENABLED},
    configPublicURL: '${process.env.CONFIG_PUBLIC_URL}',
    abhaAddressSuffix: '${process.env.ABHA_ADDRESS_SUFFIX}'
  };
`;

writeFileUsingFS(targetPath, environmentFileContent); // appending data into the target file

/* tslint:enable */
