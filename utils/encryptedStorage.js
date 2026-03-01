import CryptoJS from "crypto-js";
// import { forceLogOut } from './context/API';

const SECRET_KEY = "SUPER_SECRET_KEY";

// data to be encrypted should be sent wrapped in JSON.stringify if needed
const setEncryptedItem = (name, data) => {
    try {
        // item name encrypted with base64
        const encryptedName = window.btoa(name);

        // item data encrypted with crypto-js
        const encryptedData = data
            ? CryptoJS.AES.encrypt(
                  typeof data === "string" ? data : JSON.stringify(data),
                  SECRET_KEY
              ).toString()
            : "";

        // stored item data with encryptedName
        localStorage.setItem(encryptedName, encryptedData);
    } catch (e) {
        // console.log("setEncryptedItem error", e);
        // forceLogOut()
    }
};

// data should be parsed using JSON.parse if needed
const getDecryptedItem = (name) => {
    try {
        // item name encrypted with base64
        const encryptedName = window.btoa(name);

        // fetched item data with encryptedName
        const encryptedData = localStorage.getItem(encryptedName);

        // item data decrypted with crypto-js
        const decryptedData = encryptedData
            ? CryptoJS.AES.decrypt(encryptedData, SECRET_KEY).toString(
                  CryptoJS.enc.Utf8
              )
            : encryptedData;
        return decryptedData;
    } catch (e) {
        // console.log("getDecryptedItem error", e);
        // forceLogOut()
    }
};

const removeEncryptedItem = (name) => {
    try {
        // item name encrypted with base64
        const encryptedName = window.btoa(name);

        // removed item data with encryptedName
        localStorage.removeItem(encryptedName);
    } catch (e) {
        // console.log("removeEncryptedItem error", e);
        // forceLogOut()
    }
};

export { setEncryptedItem, getDecryptedItem, removeEncryptedItem };
