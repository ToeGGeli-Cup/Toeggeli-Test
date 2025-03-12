import { getDatabase, ref, push, remove, onValue } from "./firebase.js";

const db = getDatabase();
const newsRef = ref(db, "news");
const teamsRef = ref(db, "teams");
const matchesRef = ref(db, "matches");
const rankingRef = ref(db, "ranking");

// News hinzufügen
function addNews() {
    const newsInput = document.getElementById("newsInput");
    if (newsInput.value.trim() !== "") {
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
    const teamInput = document.getElementById("teamInput");
    if (teamInput.value.trim() !== "") {
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
    const team1 = document.getElementById("team1Input").value.trim();
    const team2 = document.getElementById("team2Input").value.trim();
    if (team1 && team2) {
        push(matchesRef, { team1, team2, score: null });
        document.getElementById("team1Input").value = "";
        document.getElementById("team2Input").value = "";
    }
}

// Spiele löschen
function deleteMatch(key) {
    remove(ref(db, `matches/${key}`));
}

// Live-Updates für News
onValue(newsRef, (snapshot) => {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const news = childSnapshot.val();
        const key = childSnapshot.key;
        const li = document.createElement("li");
        li.innerHTML = `${news.text} <button onclick="deleteNews('${key}')">Löschen</button>`;
        newsList.appendChild(li);
    });
});

// Live-Updates für Teams
onValue(teamsRef, (snapshot) => {
    const teamsList = document.getElementById("teamsList");
    teamsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        const key = childSnapshot.key;
        const li = document.createElement("li");
        li.innerHTML = `${team.name} <button onclick="deleteTeam('${key}')">Löschen</button>`;
        teamsList.appendChild(li);
    });
});

// Live-Updates für Spiele
onValue(matchesRef, (snapshot) => {
    const matchesList = document.getElementById("matchesList");
    matchesList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const match = childSnapshot.val();
        const key = childSnapshot.key;
        const li = document.createElement("li");
        li.innerHTML = `${match.team1} vs ${match.team2} 
            <button onclick="deleteMatch('${key}')">Löschen</button>`;
        matchesList.appendChild(li);
    });
});

// Live-Updates für Rangliste
onValue(rankingRef, (snapshot) => {
    const rankingTable = document.getElementById("rankingTable");
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
