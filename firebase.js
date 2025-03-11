import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, set, push, remove, update, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// Firebase-Konfiguration (füge deine echten Firebase-Daten hier ein)
const firebaseConfig = {
    apiKey: "DEINE_API_KEY",
    authDomain: "DEIN_AUTH_DOMAIN",
    databaseURL: "DEINE_DATABASE_URL",
    projectId: "DEIN_PROJECT_ID",
    storageBucket: "DEIN_STORAGE_BUCKET",
    messagingSenderId: "DEIN_MESSAGING_SENDER_ID",
    appId: "DEIN_APP_ID"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database, ref, set, push, remove, update, onValue };
