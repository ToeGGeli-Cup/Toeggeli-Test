import { database } from "./firebase.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-database.js";

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

// Spiele anzeigen
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
            const match = childSnapshot.val();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${match.team1}</td>
                <td>${match.team2}</td>
                <td>${match.result || "– : –"}</td>
            `;
            matchesTable.appendChild(row);
        });
    });
}

// Rangliste aktualisieren
function updateRankings() {
    const teamsRef = ref(database, "teams");
    const matchesRef = ref(database, "matches");

    onValue(teamsRef, (teamsSnapshot) => {
        const teams = {};
        teamsSnapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teams[team.name] = {
                name: team.name,
                games: 0,
                points: 0,
                goalsFor: 0,
                goalsAgainst: 0,
            };
        });

        onValue(matchesRef, (matchesSnapshot) => {
            if (!matchesSnapshot.exists()) {
                console.warn("⚠️ Keine Spiele vorhanden, Rangliste bleibt leer.");
                document.getElementById("rankingTable").innerHTML = "<tr><td colspan='7'>Noch keine Spiele</td></tr>";
                return;
            }

            matchesSnapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                if (!teams[match.team1] || !teams[match.team2]) return;

                teams[match.team1].games++;
                teams[match.team2].games++;

                if (match.result) {
                    const [goals1, goals2] = match.result.split(":").map(Number);
                    teams[match.team1].goalsFor += goals1;
                    teams[match.team1].goalsAgainst += goals2;
                    teams[match.team2].goalsFor += goals2;
                    teams[match.team2].goalsAgainst += goals1;

                    if (goals1 > goals2) {
                        teams[match.team1].points += 3;
                    } else if (goals1 < goals2) {
                        teams[match.team2].points += 3;
                    } else {
                        teams[match.team1].points += 1;
                        teams[match.team2].points += 1;
                    }
                }
            });

            const sortedTeams = Object.values(teams).sort((a, b) => {
                return b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
            });

            const rankingTable = document.getElementById("rankingTable");
            rankingTable.innerHTML = "";
            sortedTeams.forEach((team, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${team.name}</td>
                    <td>${team.games}</td>
                    <td>${team.points}</td>
                    <td>${team.goalsFor}</td>
                    <td>${team.goalsAgainst}</td>
                    <td>${team.goalsFor - team.goalsAgainst}</td>
                `;
                rankingTable.appendChild(row);
            });
        });
    });
}

// Initialisierung
updateNews();
updateTeams();
updateMatches();
updateRankings();
