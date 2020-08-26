const saveToStorage = (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
}

const getFromStorage = (name) => {
    return JSON.parse(localStorage.getItem(name));
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

const CheckNewVisit = (newData, oldData) => {
    const newVisit = [];
    newData.forEach(data => {
        const present = oldData.some(obj => obj.uuid === data.uuid);
        if (!present)
        newVisit.push(data)
    })
    return newVisit
}