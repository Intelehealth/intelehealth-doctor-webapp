export function getCacheData(key: string, parse: boolean = false) {
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

export function clearAllCache() {
    localStorage.clear();
}

export function isJsonString(str) {
    try {
        const json = JSON.parse(str);
        return (typeof json === 'object');
    } catch (e) {
        return false;
    }
}

export function getEncounterProviderUUID() {
    return getCacheData('visitNoteProvider', true)?.encounterProviders?.[0]?.provider?.uuid;
}

export function getEncounterUUID() {
    return getCacheData('visitNoteProvider', true)?.uuid;
}

export function suppress(fn: Function) {
    try {
        fn()
    } catch (error) { }
}

export function getPatientVisitProvider() {
    try {
        return getCacheData('patientVisitProvider', true)
    } catch (error) {
        return null
    }
}