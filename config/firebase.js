// import { initializeApp, firebase } from "firebase/app";
import firebase from "firebase/compat/app";
import { getStorage } from "firebase/storage";
import "firebase/compat/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCzmQm6q_aDrzOHaXY3WaMofBUD5cc6a9s",
    authDomain: "brijesh-sw.firebaseapp.com",
    projectId: "brijesh-sw",
    storageBucket: "brijesh-sw.appspot.com",
    messagingSenderId: "881178572393",
    appId: "1:881178572393:web:08402a2ec59f23f72ed4f8",
    measurementId: "G-Z2ML3PYCWP",
};
const app = firebase.initializeApp(firebaseConfig);
export const db = getFirestore();
const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });
export const auth = firebase.auth();
export default firebase;
export const storage = getStorage(app);
