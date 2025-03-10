import { db, ref, push, set, remove, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // Teams verwalten
    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;
        if (teamName && player1 && player2) {
            const newTeamRef = push(teamsRef);
            set(newTeamRef, { name: teamName, player1, player2 });
        }
    });

    // News verwalten
    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
        }
    });

    // Spiele anzeigen
    onValue(matchesRef, (snapshot) => {
        const upcomingMatchesTable = document.getElementById("upcomingMatches");
        upcomingMatchesTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            upcomingMatchesTable.innerHTML += `<tr>
                <td>${match.team1}</td>
                <td>${match.team2}</td>
                <td><input type="text" id="score-${childSnapshot.key}" value="${match.score || ""}">
                <button onclick="saveResult('${childSnapshot.key}')">✔️</button></td>
            </tr>`;
        });
    });

    // Ergebnisse speichern
    window.saveResult = (matchId) => {
        const scoreInput = document.getElementById(`score-${matchId}`);
        if (scoreInput) {
            set(ref(db, `matches/${matchId}/score`), scoreInput.value);
        }
    };

    // Rangliste aktualisieren
    onValue(ref(db, "ranking"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        let rank = 1;
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            rankingTable.innerHTML += `<tr>
                <td>${rank++}</td>
                <td>${team.name}</td>
                <td>${team.games}</td>
                <td>${team.points}</td>
                <td>${team.goals}</td>
                <td>${team.conceded}</td>
                <td>${team.diff}</td>
            </tr>`;
        });
    });
});
