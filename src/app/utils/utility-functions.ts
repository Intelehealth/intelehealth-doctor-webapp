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

export function clearAllCache() {
    localStorage.clear();
}