import { db, ref, push, remove, onValue } from './firebase.js';

// News hinzufügen
function addNews() {
    const newsInput = document.getElementById("newsInput").value;
    if (newsInput.trim() === "") return;
    push(ref(db, "news"), { text: newsInput });
    document.getElementById("newsInput").value = "";
}

// News aus Firebase anzeigen
function loadNews() {
    onValue(ref(db, "news"), (snapshot) => {
        const newsList = document.getElementById("newsList");
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const news = childSnapshot.val().text;
            displayListItem("newsList", news, () => deleteNews(key));
        });
    });
}

// News löschen
function deleteNews(key) {
    remove(ref(db, "news/" + key));
}

// Team hinzufügen
function addTeam() {
    const teamInput = document.getElementById("teamInput").value;
    if (teamInput.trim() === "") return;
    push(ref(db, "teams"), { name: teamInput });
    document.getElementById("teamInput").value = "";
}

// Teams aus Firebase anzeigen
function loadTeams() {
    onValue(ref(db, "teams"), (snapshot) => {
        const teamList = document.getElementById("teamList");
        teamList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const team = childSnapshot.val().name;
            displayListItem("teamList", team, () => deleteTeam(key));
        });
    });
}

// Team löschen
function deleteTeam(key) {
    remove(ref(db, "teams/" + key));
}

// Spiel hinzufügen
function addMatch() {
    const team1 = document.getElementById("team1Input").value;
    const team2 = document.getElementById("team2Input").value;
    if (team1.trim() === "" || team2.trim() === "") return;
    push(ref(db, "matches"), { team1, team2, score1: null, score2: null });
    document.getElementById("team1Input").value = "";
    document.getElementById("team2Input").value = "";
}

// Spiele aus Firebase anzeigen
function loadMatches() {
    onValue(ref(db, "matches"), (snapshot) => {
        const matchList = document.getElementById("matchList");
        matchList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const key = childSnapshot.key;
            const match = childSnapshot.val();
            const matchText = `${match.team1} vs ${match.team2}`;
            displayListItem("matchList", matchText, () => deleteMatch(key));
        });
    });
}

// Spiel löschen
function deleteMatch(key) {
    remove(ref(db, "matches/" + key));
}

// Rangliste aus Firebase laden
function loadRanking() {
    onValue(ref(db, "ranking"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        let rank = 1;
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            const row = `
                <tr>
                    <td>${rank++}</td>
                    <td>${team.name}</td>
                    <td>${team.games || 0}</td>
                    <td>${team.points || 0}</td>
                    <td>${team.goals || 0}</td>
                    <td>${team.conceded || 0}</td>
                    <td>${(team.goals || 0) - (team.conceded || 0)}</td>
                </tr>
            `;
            rankingTable.innerHTML += row;
        });
    });
}

// Hilfsfunktion zur Anzeige von Elementen mit Löschen-Button
function displayListItem(parentId, text, deleteFunction) {
    const list = document.getElementById(parentId);
    const li = document.createElement("li");
    li.textContent = text;
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.onclick = deleteFunction;
    li.appendChild(deleteBtn);
    list.appendChild(li);
}

// Daten aus Firebase beim Laden der Seite abrufen
document.addEventListener("DOMContentLoaded", () => {
    loadNews();
    loadTeams();
    loadMatches();
    loadRanking();
});
