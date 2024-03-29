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
  version:"SYR-v1.1.2",
  versionCode:"9",
  publicKey: "BMGYasq0YzQ4B9RmKuaMJY3hWcOmN-3BMZfy4e9jXXUp8w7tcoNikwXAkS86Eb9nWANm_gU7CyOaVD9zMZ0QU2w",
};
