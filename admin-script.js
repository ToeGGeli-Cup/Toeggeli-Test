import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

// NEWS VERWALTEN
window.addNews = () => {
    const newsText = document.getElementById("newsInput").value;
    if (newsText.trim() === "") return;
    push(ref(db, "news"), { text: newsText });
    document.getElementById("newsInput").value = "";
};

// NEWS LADEN
onValue(ref(db, "news"), (snapshot) => {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const newsItem = childSnapshot.val();
        newsList.innerHTML += `<li>${newsItem.text} <button class="delete-btn" onclick="deleteNews('${childSnapshot.key}')">🗑️</button></li>`;
    });
});

// NEWS LÖSCHEN
window.deleteNews = (id) => remove(ref(db, `news/${id}`));

// TEAMS VERWALTEN
window.addTeam = () => {
    const name = document.getElementById("teamName").value.trim();
    const player1 = document.getElementById("player1").value.trim();
    const player2 = document.getElementById("player2").value.trim();
    if (!name || !player1 || !player2) return;
    push(ref(db, "teams"), { name, player1, player2 });
    document.getElementById("teamName").value = "";
    document.getElementById("player1").value = "";
    document.getElementById("player2").value = "";
};

// TEAMS LADEN
onValue(ref(db, "teams"), (snapshot) => {
    const teamsTable = document.getElementById("teamsTable");
    teamsTable.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        teamsTable.innerHTML += `<tr>
            <td>${team.name}</td>
            <td>${team.player1}</td>
            <td>${team.player2}</td>
            <td><button class="delete-btn" onclick="deleteTeam('${childSnapshot.key}')">🗑️</button></td>
        </tr>`;
    });
});

// TEAMS LÖSCHEN
window.deleteTeam = (id) => remove(ref(db, `teams/${id}`));

// SPIELE LADEN
onValue(ref(db, "matches"), (snapshot) => {
    const matchesTable = document.getElementById("matchesTable");
    matchesTable.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const match = childSnapshot.val();
        matchesTable.innerHTML += `<tr>
            <td>${match.team1}</td>
            <td>${match.team2}</td>
            <td>${match.score || "-"}</td>
            <td><button onclick="updateScore('${childSnapshot.key}')">✏️</button></td>
        </tr>`;
    });
});

// SPIELERGEBNIS AKTUALISIEREN
window.updateScore = (matchId) => {
    const newScore = prompt("Neues Ergebnis eingeben (X:Y):");
    if (newScore && /^\d+:\d+$/.test(newScore)) {
        update(ref(db, `matches/${matchId}`), { score: newScore });
    }
};

// RANGLISTE LADEN
onValue(ref(db, "ranking"), (snapshot) => {
    const rankingTable = document.getElementById("rankingTable");
    rankingTable.innerHTML = "";
    if (!snapshot.exists()) return;
    const rankings = snapshot.val();
    const sortedTeams = Object.keys(rankings).sort((a, b) =>
        rankings[b].points - rankings[a].points ||
        rankings[b].diff - rankings[a].diff ||
        rankings[b].goals - rankings[a].goals
    );

    sortedTeams.forEach((team, index) => {
        const teamData = rankings[team];
        rankingTable.innerHTML += `<tr>
            <td>${index + 1}</td>
            <td>${team}</td>
            <td>${teamData.games}</td>
            <td>${teamData.points}</td>
            <td>${teamData.goals}</td>
            <td>${teamData.conceded}</td>
            <td>${teamData.diff}</td>
        </tr>`;
    });
});
