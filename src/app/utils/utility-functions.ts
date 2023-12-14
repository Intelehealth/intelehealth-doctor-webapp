import { visitTypes } from "src/config/constant";

export function getCacheData(parse: boolean, key: string) {
    if (parse) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (error) {
            return null
        }
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
        const json = JSON.parse(str);
        return (typeof json === 'object');
    } catch (e) {
        return false;
    }
}

export function getEncounterProviderUUID() {
    return getCacheData(true, visitTypes.VISIT_NOTE_PROVIDER).encounterProviders[0].provider.uuid;
}

export function getEncounterUUID() {
    return getCacheData(true, visitTypes.VISIT_NOTE_PROVIDER).uuid;
}
