const saveToStorage = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
}

const getFromStorage = (name) => {
    const item = localStorage.getItem(name);
    if (item !== 'undefined') {
        return JSON.parse(item);
    } else return undefined;
}

const deleteFromStorage = (name) => {
    localStorage.removeItem(name);
}

const getEncounterProviderUUID = () => {
    return getFromStorage('visitNoteProvider').encounterProviders[0].provider.uuid;
}

const getEncounterUUID = () => {
    return getFromStorage('visitNoteProvider').uuid;
}