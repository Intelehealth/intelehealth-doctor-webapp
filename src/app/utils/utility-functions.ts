export function getCacheData(parse: boolean, key: string) {
  if (parse) {
    return JSON.parse(localStorage.getItem(key));
  } else {
    return localStorage.getItem(key);
  }
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
  return getCacheData(true,'visitNoteProvider').encounterProviders[0].provider.uuid;
}

export function getEncounterUUID() {
  return getCacheData(true,'visitNoteProvider').uuid;
}
