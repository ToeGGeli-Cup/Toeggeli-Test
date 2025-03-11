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
                <td><button onclick="deleteNews('${childSnapshot.key}')">Löschen</button></td>
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
                <td><button onclick="deleteTeam('${childSnapshot.key}')">Löschen</button></td>
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

// OFFENE SPIELE LADEN
function loadGames() {
    const gamesRef = ref(db, "matches");
    onValue(gamesRef, (snapshot) => {
        const openTable = document.getElementById("openGamesTable");
        const resultsTable = document.getElementById("resultsTable");
        openTable.innerHTML = "";
        resultsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score) {
                resultsTable.innerHTML += `<tr>
                    <td>${match.date}</td>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>${match.score}</td>
                </tr>`;
            } else {
                openTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>
                        <input id="score_${childSnapshot.key}" placeholder="Ergebnis">
                        <button onclick="setScore('${childSnapshot.key}')">Speichern</button>
                    </td>
                </tr>`;
            }
        });
    });
}

// SPIEL HINZUFÜGEN
window.addGame = function() {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    if (!team1 || !team2) return;
    const newGameRef = push(ref(db, "matches"));
    set(newGameRef, { team1: team1, team2: team2, score: null });
};

// ERGEBNIS SPEICHERN
window.setScore = function(id) {
    const score = document.getElementById(`score_${id}`).value;
    if (!score) return;
    update(ref(db, `matches/${id}`), { score: score, date: new Date().toLocaleDateString() });
};

// LADEN BEIM START
document.addEventListener("DOMContentLoaded", () => {
    loadNews();
    loadTeams();
    loadGames();
});
