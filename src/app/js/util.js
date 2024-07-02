const saveToStorage = (name, value, stringify=true) => {
    if(stringify){
        localStorage.setItem(name, JSON.stringify(value));
    } else {
        localStorage.setItem(name, value);
    }
}

const getFromStorage = (name, parse=true) => {
    try {
        if(parse){
            return JSON.parse(localStorage.getItem(name));
        }else{
            return localStorage.getItem(name);
        }
    } catch (error) {
        return null;        
    }
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
    newData.forEach((data,index) => {
        const present = oldData.some(obj => obj.uuid === data.uuid);
        if (!present)
        newVisit.push({index,data})
    })
    return newVisit
}

const CheckVisitNote = (visit, visitNoteList) => {
    return visitNoteList.filter(vN => vN.uuid === visit.data.uuid)   
}