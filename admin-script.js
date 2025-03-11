import { database } from "./firebase.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

// News anzeigen
function updateNews() {
    const newsRef = ref(database, "news");
    onValue(newsRef, (snapshot) => {
        const newsTable = document.getElementById("newsTable");
        newsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            const row = document.createElement("tr");
            row.innerHTML = `<td>${newsItem}</td>`;
            newsTable.appendChild(row);
        });
    });
}

// Teams anzeigen
function updateTeams() {
    const teamsRef = ref(database, "teams");
    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            const row = document.createElement("tr");
            row.innerHTML = `<td>${team.name}</td><td>${team.player1}</td><td>${team.player2}</td>`;
            teamsTable.appendChild(row);
        });
    });
}

// Spiele anzeigen & Ergebnisse eintragen
function updateMatches() {
    const matchesRef = ref(database, "matches");
    onValue(matchesRef, (snapshot) => {
        const matchesTable = document.getElementById("matchesTable");
        matchesTable.innerHTML = "";
        if (!snapshot.exists()) {
            console.warn("⚠️ Keine Spiele gefunden!");
            return;
        }
        snapshot.forEach((childSnapshot) => {
            const matchKey = childSnapshot.key;
            const match = childSnapshot.val();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${match.team1}</td>
                <td>${match.team2}</td>
                <td>
                    <input type="text" id="result-${matchKey}" value="${match.result || ""}" placeholder="x:x">
                </td>
                <td>
                    <button onclick="saveResult('${matchKey}')">Speichern</button>
                </td>
            `;
            matchesTable.appendChild(row);
        });
    });
}

// Ergebnis speichern
window.saveResult = function (matchKey) {
    const resultInput = document.getElementById(`result-${matchKey}`);
    const newResult = resultInput.value.trim();

    if (!/^\d+:\d+$/.test(newResult)) {
        alert("❌ Ungültiges Format! Bitte im Format x:x eingeben.");
        return;
    }

    const matchRef = ref(database, `matches/${matchKey}`);
    update(matchRef, { result: newResult })
        .then(() => {
            console.log(`✅ Ergebnis gespeichert: ${newResult}`);
            alert("✅ Ergebnis erfolgreich gespeichert!");
        })
        .catch((error) => {
            console.error("❌ Fehler beim Speichern:", error);
        });
};

// Initialisierung
updateNews();
updateTeams();
updateMatches();
