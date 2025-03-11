import { database, ref, push, set, onValue, remove, update } from "./firebase.js";

// 🌍 NEWS VERWALTEN
function addNews() {
    const newsText = document.getElementById("newsText").value;
    if (!newsText) return alert("Bitte eine Nachricht eingeben.");
    
    const newsRef = ref(database, "news/");
    const newNews = push(newsRef);
    set(newNews, { text: newsText, date: new Date().toLocaleDateString("de-DE") });
    
    document.getElementById("newsText").value = "";
}

// 🗑️ NEWS LÖSCHEN
function deleteNews(newsId) {
    remove(ref(database, `news/${newsId}`));
}

// 🔄 NEWS LADEN
function loadNews() {
    const newsRef = ref(database, "news/");
    onValue(newsRef, (snapshot) => {
        const newsTable = document.getElementById("newsTable");
        newsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const news = childSnapshot.val();
            newsTable.innerHTML += `
                <tr>
                    <td>${news.date}</td>
                    <td>${news.text}</td>
                    <td><button onclick="deleteNews('${childSnapshot.key}')">Löschen</button></td>
                </tr>
            `;
        });
    });
}

// 🌍 TEAMS VERWALTEN
function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    if (!teamName || !player1 || !player2) return alert("Alle Felder ausfüllen!");

    const teamRef = ref(database, "teams/");
    const newTeam = push(teamRef);
    set(newTeam, { name: teamName, player1, player2 });

    document.getElementById("teamName").value = "";
    document.getElementById("player1").value = "";
    document.getElementById("player2").value = "";
}

// 🗑️ TEAMS LÖSCHEN
function deleteTeam(teamId) {
    remove(ref(database, `teams/${teamId}`));
}

// 🔄 TEAMS LADEN
function loadTeams() {
    const teamsRef = ref(database, "teams/");
    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teamsTable.innerHTML += `
                <tr>
                    <td>${team.name}</td>
                    <td>${team.player1}</td>
                    <td>${team.player2}</td>
                    <td><button onclick="deleteTeam('${childSnapshot.key}')">Löschen</button></td>
                </tr>
            `;
        });
    });
}

// 🌍 SPIELE HINZUFÜGEN
function addGame() {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    if (!team1 || !team2) return alert("Beide Teams auswählen!");

    const matchesRef = ref(database, "matches/");
    const newMatch = push(matchesRef);
    set(newMatch, { team1, team2, result: null });

    document.getElementById("team1").value = "";
    document.getElementById("team2").value = "";
}

// 🗑️ SPIEL LÖSCHEN
function deleteGame(matchId) {
    remove(ref(database, `matches/${matchId}`));
}

// 🔄 OFFENE SPIELE LADEN
function loadOpenGames() {
    const matchesRef = ref(database, "matches/");
    onValue(matchesRef, (snapshot) => {
        const openGamesTable = document.getElementById("openGamesTable");
        openGamesTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (!match.result) {
                openGamesTable.innerHTML += `
                    <tr>
                        <td>${match.team1}</td>
                        <td>${match.team2}</td>
                        <td>
                            <button onclick="deleteGame('${childSnapshot.key}')">Löschen</button>
                            <button onclick="enterResult('${childSnapshot.key}')">Ergebnis eintragen</button>
                        </td>
                    </tr>
                `;
            }
        });
    });
}

// 🌍 ERGEBNISSE EINTRAGEN
function enterResult(matchId) {
    const result = prompt("Ergebnis eingeben (z.B. 3:2)");
    if (!result) return;

    const matchRef = ref(database, `matches/${matchId}`);
    update(matchRef, { result, date: new Date().toLocaleDateString("de-DE") });
}

// 🔄 ERGEBNISSE LADEN
function loadResults() {
    const matchesRef = ref(database, "matches/");
    onValue(matchesRef, (snapshot) => {
        const resultsTable = document.getElementById("resultsTable");
        resultsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.result) {
                resultsTable.innerHTML += `
                    <tr>
                        <td>${match.date}</td>
                        <td>${match.team1}</td>
                        <td>${match.team2}</td>
                        <td>${match.result}</td>
                    </tr>
                `;
            }
        });
    });
}

// 🔄 RANGLISTE LADEN
function loadRanking() {
    const rankingRef = ref(database, "ranking/");
    onValue(rankingRef, (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        snapshot.forEach((childSnapshot, index) => {
            const team = childSnapshot.val();
            rankingTable.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${team.name}</td>
                    <td>${team.games}</td>
                    <td>${team.points}</td>
                    <td>${team.goals}</td>
                    <td>${team.goalsAgainst}</td>
                    <td>${team.goalDifference}</td>
                </tr>
            `;
        });
    });
}

// 🔄 ALLE DATEN LADEN
function loadData() {
    loadNews();
    loadTeams();
    loadOpenGames();
    loadResults();
    loadRanking();
}

window.onload = loadData;
window.addNews = addNews;
window.deleteNews = deleteNews;
window.addTeam = addTeam;
window.deleteTeam = deleteTeam;
window.addGame = addGame;
window.deleteGame = deleteGame;
window.enterResult = enterResult;
