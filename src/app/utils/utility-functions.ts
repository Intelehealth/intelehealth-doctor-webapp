export function getCacheData(key: string) {
  return localStorage.getItem(key);
}

export function setCacheData(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function deleteCacheData(key: string) {
  localStorage.removeItem(key);
}

export function isJsonString(str) {
  try {
    var json = JSON.parse(str);
    return (typeof json === 'object');
  } catch (e) {
    return false;
  }
}

export function getEncounterProviderUUID() {
  return JSON.parse(getCacheData('visitNoteProvider')).encounterProviders[0].provider.uuid;
}

export function getEncounterUUID() {
  return JSON.parse(getCacheData('visitNoteProvider')).uuid;
}
