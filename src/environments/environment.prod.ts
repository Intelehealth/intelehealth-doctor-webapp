// export const environment = {
//   production: true,
//   baseURL: `${window.location.protocol}//${window.location.host}/openmrs/ws/rest/v1`,
//   baseURLCoreApp : `${window.location.protocol}//${window.location.host}/openmrs/coreapps/diagnoses`,
//   baseURLLegacy: `${window.location.protocol}//${window.location.host}/openmrs`,
//   mindmapURL: `${window.location.protocol}//${window.location.hostname}:3004/api`,
//   notificationURL: `${window.location.protocol}//${window.location.hostname}:3004/notification`
// };
export const environment = {
  production: true,
  baseURL: 'https://testing.intelehealth.org/openmrs/ws/rest/v1',
  baseURLCoreApp : 'https://testing.intelehealth.org/openmrs/coreapps/diagnoses',
  baseURLLegacy: 'https://testing.intelehealth.org/openmrs',
  mindmapURL: 'http://localhost:3004/api',
  notificationURL: 'http://localhost:3004/notification'
};
