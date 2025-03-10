// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2nmuFhdG0ZU5wO9H7CqsxPnRF04WZLzY",
    authDomain: "toeggeli-cup-2025.firebaseapp.com",
    databaseURL: "https://toeggeli-cup-2025-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "toeggeli-cup-2025",
    storageBucket: "toeggeli-cup-2025.firebasestorage.app",
    messagingSenderId: "810841513587",
    appId: "1:810841513587:web:fc9d2b0274cf92b3ae1406"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, get, update };
