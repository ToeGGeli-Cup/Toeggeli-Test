import { getDatabase, ref, push, remove, onValue } from "./firebase.js";

const db = getDatabase();
const newsRef = ref(db, "news");
const teamsRef = ref(db, "teams");
const matchesRef = ref(db, "matches");
const rankingRef = ref(db, "ranking");

// Funktion zur Überprüfung, ob ein Element existiert
function getElement(id) {
    return document.getElementById(id) || null;
}

// News hinzufügen
function addNews() {
    const newsInput = getElement("newsInput");
    if (newsInput && newsInput.value.trim() !== "") {
        push(newsRef, { text: newsInput.value.trim() });
        newsInput.value = "";
    }
}

// News löschen
function deleteNews(key) {
    remove(ref(db, `news/${key}`));
}

// Teams hinzufügen
function addTeam() {
    const teamInput = getElement("teamInput");
    if (teamInput && teamInput.value.trim() !== "") {
        push(teamsRef, { name: teamInput.value.trim() });
        teamInput.value = "";
    }
}

// Teams löschen
function deleteTeam(key) {
    remove(ref(db, `teams/${key}`));
}

// Spiele hinzufügen
function addMatch() {
    const team1 = getElement("team1Input")?.value.trim();
    const team2 = getElement("team2Input")?.value.trim();
    if (team1 && team2) {
        push(matchesRef, { team1, team2, score: null });
        getElement("team1Input").value = "";
        getElement("team2Input").value = "";
    }
}

// Spiele löschen
function deleteMatch(key) {
    remove(ref(db, `matches/${key}`));
}

// Live-Updates für News
onValue(newsRef, (snapshot) => {
    const newsList = getElement("newsList");
    if (!newsList) return;  // Falls das Element nicht existiert, abbrechen
    newsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const news = childSnapshot.val();
        const key = childSnapshot.key;
        const li = document.createElement("li");
        li.innerHTML = `${news.text} <button onclick="deleteNews('${key}')">🗑️</button>`;
        newsList.appendChild(li);
    });
});

// Live-Updates für Teams
onValue(teamsRef, (snapshot) => {
    const teamsList = getElement("teamsList");
    if (!teamsList) return;
    teamsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        const key = childSnapshot.key;
        const li = document.createElement("li");
        li.innerHTML = `${team.name} <button onclick="deleteTeam('${key}')">🗑️</button>`;
        teamsList.appendChild(li);
    });
});

// Live-Updates für Spiele
onValue(matchesRef, (snapshot) => {
    const matchesList = getElement("matchesList");
    if (!matchesList) return;
    matchesList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const match = childSnapshot.val();
        const key = childSnapshot.key;
        const li = document.createElement("li");
        li.innerHTML = `${match.team1} vs ${match.team2} 
            <button onclick="deleteMatch('${key}')">🗑️</button>`;
        matchesList.appendChild(li);
    });
});

// Live-Updates für Rangliste
onValue(rankingRef, (snapshot) => {
    const rankingTable = getElement("rankingTable");
    if (!rankingTable) return;
    rankingTable.innerHTML = "";
    let rank = 1;
    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        const row = rankingTable.insertRow();
        row.innerHTML = `
            <td>${rank++}</td>
            <td>${team.name}</td>
            <td>${team.games}</td>
            <td>${team.points}</td>
            <td>${team.goals}</td>
            <td>${team.goalsAgainst}</td>
            <td>${team.goalDifference}</td>
        `;
    });
});

// Stellt sicher, dass Funktionen global verfügbar sind
window.addNews = addNews;
window.deleteNews = deleteNews;
window.addTeam = addTeam;
window.deleteTeam = deleteTeam;
window.addMatch = addMatch;
window.deleteMatch = deleteMatch;
