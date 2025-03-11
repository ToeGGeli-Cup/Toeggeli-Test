import { database, ref, set, push, remove, update, onValue } from "./firebase.js";

// Referenzen in der Firebase-Datenbank
const teamsRef = ref(database, "teams");
const gamesRef = ref(database, "games");
const newsRef = ref(database, "news");

// Teams hinzufügen
document.getElementById("addTeamBtn").addEventListener("click", function () {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;

    if (teamName && player1 && player2) {
        push(teamsRef, {
            name: teamName,
            player1: player1,
            player2: player2
        });
    }
});

// Spiele hinzufügen
document.getElementById("addGameBtn").addEventListener("click", function () {
    const team1 = document.getElementById("gameTeam1").value;
    const team2 = document.getElementById("gameTeam2").value;

    if (team1 && team2) {
        push(gamesRef, {
            team1: team1,
            team2: team2,
            score1: 0,
            score2: 0
        });
    }
});

// Ergebnisse eintragen
document.getElementById("saveResultsBtn").addEventListener("click", function () {
    const gameId = document.getElementById("gameId").value;
    const score1 = document.getElementById("score1").value;
    const score2 = document.getElementById("score2").value;

    if (gameId && score1 !== "" && score2 !== "") {
        update(ref(database, "games/" + gameId), {
            score1: parseInt(score1),
            score2: parseInt(score2)
        });
    }
});

// Teams laden
onValue(teamsRef, (snapshot) => {
    const teamsTable = document.getElementById("teamsTable");
    teamsTable.innerHTML = ""; // Tabelle leeren

    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        teamsTable.innerHTML += `<tr><td>${team.name}</td><td>${team.player1}</td><td>${team.player2}</td></tr>`;
    });
});

// Spiele laden
onValue(gamesRef, (snapshot) => {
    const gamesTable = document.getElementById("gamesTable");
    gamesTable.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
        const game = childSnapshot.val();
        gamesTable.innerHTML += `<tr>
            <td>${game.team1}</td>
            <td>${game.team2}</td>
            <td><input type="text" id="score1-${childSnapshot.key}" value="${game.score1}"> : 
                <input type="text" id="score2-${childSnapshot.key}" value="${game.score2}">
            </td>
            <td><button onclick="saveResult('${childSnapshot.key}')">Speichern</button></td>
        </tr>`;
    });
});

// Ergebnis speichern Funktion
function saveResult(gameId) {
    const score1 = document.getElementById(`score1-${gameId}`).value;
    const score2 = document.getElementById(`score2-${gameId}`).value;

    if (score1 !== "" && score2 !== "") {
        update(ref(database, "games/" + gameId), {
            score1: parseInt(score1),
            score2: parseInt(score2)
        });
    }
}
