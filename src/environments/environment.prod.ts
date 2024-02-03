export const environment = {
  production: true,
  baseURL: `${window.location.protocol}//${window.location.host}/openmrs/ws/rest/v1`,
  baseURLCoreApp: `${window.location.protocol}//${window.location.host}/openmrs/coreapps/diagnoses`,
  baseURLLegacy: `${window.location.protocol}//${window.location.host}/openmrs`,
  mindmapURL: `${window.location.protocol}//${window.location.hostname}:3004/api`,
  notificationURL: `${window.location.protocol}//${window.location.hostname}:3004/notification`,
  socketURL: `${window.location.protocol}//${window.location.hostname}:3004`,
  webrtcSdkServerUrl: `wss://${window.location.hostname}:9090`,
  webrtcTokenServerUrl: `${window.location.protocol}//${window.location.hostname}:3000/`,
  authSvcUrl: `${window.location.protocol}//${window.location.hostname}:3030/`,
  version: "AEAT-v1.9.0",
  versionCode: "48",
  // vapidKey: "BHkKl1nW4sC_os9IRMGhrSZ4JJp0RHl2_PxTdV_rElOjnHe-dq1hx2zw_bTgrkc4ulFD-VD4x6P63qN1Giroe7U" /** afitrianing */
  vapidKey: "BO4jQA2_cu-WSdDY0HCbB9OKplPYpCRvjDwmjEPQd7K7m1bIrtjeW7FXCntUUkm2V0eAKh9AGKqmpR4-_gYSYX8" /** afi prod */
};
