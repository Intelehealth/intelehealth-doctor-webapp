/**
 * Stores value to the localStorage as key value
 * @param {String} key
 * @param {any} dataValue
 */
const saveToStorage = (name, value) => {
  localStorage.setItem(name, JSON.stringify(value));
};

/**
 * Fetch value from localStorage by its key
 * @param key String 
 * @returns any
 */
const getFromStorage = (name) => {
  return JSON.parse(localStorage.getItem(name));
};

/**
 * Delete value from localStorage by its key
 * @param key String
 */
const deleteFromStorage = (name) => {
  localStorage.removeItem(name);
};

/**
 * Returns Encounter's Providers UUID
 * @returns String
 */
const getEncounterProviderUUID = () => {
  return getFromStorage("visitNoteProvider").encounterProviders[0].provider
    .uuid;
};

/**
 * Return's Encounter's uuid
 * @returns String
 */
const getEncounterUUID = () => {
  return getFromStorage("visitNoteProvider").uuid;
};

const CheckNewVisit = (newData, oldData) => {
  const newVisit = [];
  newData.forEach((data, index) => {
    const present = oldData.some((obj) => obj.uuid === data.uuid);
    if (!present) newVisit.push({ index, data });
  });
  return newVisit;
};

const CheckVisitNote = (visit, visitNoteList) => {
  return visitNoteList.filter((vN) => vN.uuid === visit.data.uuid);
};
