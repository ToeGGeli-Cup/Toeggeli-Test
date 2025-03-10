import { db, ref, push, set, remove, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // TEAMS HINZUFÜGEN
    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;

        if (teamName && player1 && player2) {
            const newTeamRef = push(teamsRef);
            set(newTeamRef, { name: teamName, player1, player2 });
        }
    });

    // TEAMS LADEN
    onValue(teamsRef, (snapshot) => {
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

    // TEAM LÖSCHEN
    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
    };

    // NEWS LADEN UND ANZEIGEN
    onValue(newsRef, (snapshot) => {
        const newsList = document.getElementById("newsList");
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsList.innerHTML += `<li>${newsItem.date}: ${newsItem.text} 
                <button class="delete-btn" onclick="deleteNews('${childSnapshot.key}')">🗑️</button></li>`;
        });
    });

    // NEWS LÖSCHEN
    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };

    // SPIELE GENERIEREN (ROUND ROBIN)
    function generateMatches(teams) {
        let matchList = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matchList.push({ team1: teams[i].name, team2: teams[j].name, score: "-" });
            }
        }
        return matchList;
    }

    // SPIELE IN DIE DATENBANK EINTRAGEN
    onValue(teamsRef, (snapshot) => {
        let teams = [];
        snapshot.forEach((childSnapshot) => {
            teams.push(childSnapshot.val());
        });

        if (teams.length > 1) {
            const matches = generateMatches(teams);
            set(matchesRef, matches);
        }
    });

    // OFFENE SPIELE LADEN
    onValue(matchesRef, (snapshot) => {
        const upcomingTable = document.getElementById("upcomingMatches");
        const resultsTable = document.getElementById("resultsTable");
        upcomingTable.innerHTML = "";
        resultsTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const matchKey = childSnapshot.key;
            if (match.score === "-") {
                upcomingTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><input type="text" id="score-${matchKey}" placeholder="z.B. 3:2">
                    <button onclick="saveResult('${matchKey}')">Speichern</button></td>
                </tr>`;
            } else {
                resultsTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>${match.score}</td>
                </tr>`;
            }
        });

        updateRankings(snapshot);
    });

    // RESULTATE SPEICHERN
    window.saveResult = (matchId) => {
        const scoreInput = document.getElementById(`score-${matchId}`).value;
        if (scoreInput) {
            set(ref(db, `matches/${matchId}/score`), scoreInput);
        }
    };

    // RANGLISTE BERECHNEN
    function updateRankings(snapshot) {
        const rankings = {};

        // TEAMS INITIALISIEREN
        onValue(teamsRef, (teamsSnapshot) => {
            teamsSnapshot.forEach((childSnapshot) => {
                const team = childSnapshot.val().name;
                rankings[team] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            });

            // SPIELERGEBNISSE AUSWERTEN
            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                if (match.score && match.score !== "-") {
                    const [g1, g2] = match.score.split(":").map(Number);
                    
                    rankings[match.team1].games += 1;
                    rankings[match.team2].games += 1;
                    rankings[match.team1].goals += g1;
                    rankings[match.team2].goals += g2;
                    rankings[match.team1].conceded += g2;
                    rankings[match.team2].conceded += g1;
                    rankings[match.team1].diff = rankings[match.team1].goals - rankings[match.team1].conceded;
                    rankings[match.team2].diff = rankings[match.team2].goals - rankings[match.team2].conceded;

                    // PUNKTEVERGABE
                    if (g1 > g2) rankings[match.team1].points += 3;
                    else if (g2 > g1) rankings[match.team2].points += 3;
                    else {
                        rankings[match.team1].points += 1;
                        rankings[match.team2].points += 1;
                    }
                }
            });

            // RANGLISTE SORTIEREN UND ANZEIGEN
            const rankingTable = document.getElementById("rankingTable");
            rankingTable.innerHTML = "";
            const sortedTeams = Object.keys(rankings).sort((a, b) =>
                rankings[b].points - rankings[a].points ||
                rankings[b].diff - rankings[a].diff ||
                rankings[b].goals - rankings[a].goals
            );

            sortedTeams.forEach((team, index) => {
                rankingTable.innerHTML += `<tr>
                    <td>${index + 1}</td>
                    <td>${team}</td>
                    <td>${rankings[team].games}</td>
                    <td>${rankings[team].points}</td>
                    <td>${rankings[team].goals}</td>
                    <td>${rankings[team].conceded}</td>
                    <td>${rankings[team].diff}</td>
                </tr>`;
            });
        });
    }
});
