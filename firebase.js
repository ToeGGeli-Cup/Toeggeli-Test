import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";


// 🔥 Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "AIzaSyD2nmuFhdG0ZU5wO9H7CqsxPnRF04WZLzY",
    authDomain: "toeggeli-cup-2025.firebaseapp.com",
    databaseURL: "https://toeggeli-cup-2025-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "toeggeli-cup-2025",
    storageBucket: "toeggeli-cup-2025.firebasestorage.app",
    messagingSenderId: "810841513587",
    appId: "1:810841513587:web:fc9d2b0274cf92b3ae1406"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("✅ Firebase erfolgreich initialisiert!");

// Test: Daten auslesen
const testRef = ref(db, "/");
get(testRef).then(snapshot => {
    if (snapshot.exists()) {
        console.log("🔥 Firebase Daten gefunden:", snapshot.val());
    } else {
        console.log("⚠️ Keine Daten in Firebase gefunden!");
    }
}).catch(error => console.error("❌ Fehler beim Firebase-Lesen:", error));

export { db, ref, set, get, update, onValue, push };
