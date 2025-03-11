import { db, ref, onValue, set, push, remove, update } from "./firebase.js";

// NEWS LADEN
function loadNews() {
    const newsRef = ref(db, "news");
    onValue(newsRef, (snapshot) => {
        const table = document.getElementById("newsTable");
        table.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const news = childSnapshot.val();
            table.innerHTML += `<tr>
                <td>${news.date}</td>
                <td>${news.text}</td>
                <td>
                    <button onclick="deleteNews('${childSnapshot.key}')">Löschen</button>
                </td>
            </tr>`;
        });
    });
}

// NEWS HINZUFÜGEN
window.addNews = function() {
    const newsText = document.getElementById("newsText").value;
    if (!newsText) return;
    const newNewsRef = push(ref(db, "news"));
    set(newNewsRef, { date: new Date().toLocaleDateString(), text: newsText });
    document.getElementById("newsText").value = "";
};

// NEWS LÖSCHEN
window.deleteNews = function(id) {
    remove(ref(db, `news/${id}`));
};

// TEAMS LADEN
function loadTeams() {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
        const table = document.getElementById("teamsTable");
        table.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            table.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
                <td>
                    <button onclick="deleteTeam('${childSnapshot.key}')">Löschen</button>
                </td>
            </tr>`;
        });
    });
}

// TEAM HINZUFÜGEN
window.addTeam = function() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    if (!teamName || !player1 || !player2) return;
    const newTeamRef = push(ref(db, "teams"));
    set(newTeamRef, { name: teamName, player1: player1, player2: player2 });
    document.getElementById("teamName").value = "";
    document.getElementById("player1").value = "";
    document.getElementById("player2").value = "";
};

// TEAM LÖSCHEN
window.deleteTeam = function(id) {
    remove(ref(db, `teams/${id}`));
};

// SPIELE LADEN
function loadGames() {
    const gamesRef = ref(db, "matches");
    onValue(gamesRef, (snapshot) => {
        const table = document.getElementById("gamesTable");
        table.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            table.innerHTML += `<tr>
                <td>${match.team1}</td>
                <td>${match.team2}</td>
                <td>${match.score || "-"}</td>
                <td>
                    <button onclick="deleteGame('${childSnapshot.key}')">Löschen</button>
                </td>
            </tr>`;
        });
    });
}

// SPIEL HINZUFÜGEN
window.addGame = function() {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    const score = document.getElementById("score").value || "-";
    if (!team1 || !team2) return;
    const newGameRef = push(ref(db, "matches"));
    set(newGameRef, { team1: team1, team2: team2, score: score });
    document.getElementById("team1").value = "";
    document.getElementById("team2").value = "";
    document.getElementById("score").value = "";
};

// SPIEL LÖSCHEN
window.deleteGame = function(id) {
    remove(ref(db, `matches/${id}`));
};

// LADEN DER DATEN BEIM START
document.addEventListener("DOMContentLoaded", () => {
    loadNews();
    loadTeams();
    loadGames();
});
