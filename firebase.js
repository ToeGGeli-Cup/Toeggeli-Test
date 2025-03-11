// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, set, push, remove, update, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Deine Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "DEIN-API-KEY",
    authDomain: "DEIN-FIREBASE-URL",
    databaseURL: "https://DEIN-FIREBASE-URL.firebaseio.com",
    projectId: "DEIN-PROJECT-ID",
    storageBucket: "DEIN-STORAGE-BUCKET",
    messagingSenderId: "DEIN-SENDER-ID",
    appId: "DEINE-APP-ID"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export für andere Dateien
export { database, ref, set, push, remove, update, onValue };
