// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // for Firestore

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCmrJeIrtzqNMyqaLkLbq_Qsfdh_GFookk",
    authDomain: "codesync-b3786.firebaseapp.com",
    projectId: "codesync-b3786",
    storageBucket: "codesync-b3786.firebasestorage.app",
    messagingSenderId: "617629620202",
    appId: "1:617629620202:web:e64c61a904115402df8493"
};

const app = initializeApp(firebaseConfig);

// choose whichever DB you want to use
// const db = getDatabase(app);       // Realtime DB
const db = getFirestore(app);   

export { db };
