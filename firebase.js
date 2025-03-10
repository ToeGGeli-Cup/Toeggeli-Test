// Import Firebase SDK-Module
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, set, remove, update, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "DEINE_API_KEY",
    authDomain: "toeggeli-cup-2025.firebaseapp.com",
    databaseURL: "https://toeggeli-cup-2025-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "toeggeli-cup-2025",
    storageBucket: "toeggeli-cup-2025.appspot.com",
    messagingSenderId: "810841513587",
    appId: "1:810841513587:web:fc9d2b0274cf92b3ae1406"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, push, set, remove, update, onValue };
