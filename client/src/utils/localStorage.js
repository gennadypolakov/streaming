const localStorageAvailable = () => {
    try {
        localStorage.setItem('_test_', '_test_');
        localStorage.removeItem('_test_');
        return true;
    }
    catch (e) {
        return false;
    }
}


export const clientData = name => {
    if (localStorageAvailable() && localStorage[name]) {
        return JSON.parse(localStorage[name]);
    } else return false;
}