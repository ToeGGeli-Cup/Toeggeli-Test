import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, set, push, remove, update, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js"; 

const firebaseConfig = {
    apiKey: "DEINE_API_KEY",
    authDomain: "DEIN_AUTH_DOMAIN",
    databaseURL: "https://toeggeli-cup-2025-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "toeggeli-cup-2025",
    storageBucket: "DEINE_STORAGE_BUCKET",
    messagingSenderId: "DEINE_MESSAGING_SENDER_ID",
    appId: "DEINE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, push, remove, update, onValue };
