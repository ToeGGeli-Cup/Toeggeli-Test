import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");

    // Teams anzeigen
    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        const teams = [];
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teams.push(team.name);
            teamsTable.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
                <td><button onclick="deleteTeam('${childSnapshot.key}')">🗑️</button></td>
            </tr>`;
        });

        if (teams.length > 1) {
            updateMatches(teams); // Spiele aktualisieren, ohne Ergebnisse zu löschen
        }
    });

    // Teams löschen
    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
    };

    // **FIX: Spiele korrekt generieren & verwalten (ohne bestehende Ergebnisse zu überschreiben)**
    function updateMatches(teams) {
        onValue(matchesRef, (snapshot) => {
            const existingMatches = {};
            snapshot.forEach((childSnapshot) => {
                const matchId = childSnapshot.key;
                const match = childSnapshot.val();
                existingMatches[matchId] = match; // Bestehende Spiele speichern
            });

            const newMatches = { ...existingMatches }; // Kopiere existierende Spiele

            // **Neue Spiele hinzufügen, falls sie noch nicht existieren**
            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const matchId = `${teams[i]}_vs_${teams[j]}`;
                    if (!existingMatches[matchId]) {
                        newMatches[matchId] = {
                            team1: teams[i],
                            team2: teams[j],
                            score: "-"
                        };
                    }
                }
            }

            // **Nicht mehr benötigte Spiele entfernen, falls ein Team gelöscht wurde**
            for (let matchId in existingMatches) {
                const { team1, team2 } = existingMatches[matchId];
                if (!teams.includes(team1) || !teams.includes(team2)) {
                    delete newMatches[matchId]; // Entferne das Spiel
                }
            }

            // **Aktualisierte Matches in die Datenbank schreiben**
            set(matchesRef, newMatches);
        });
    }

    // Spiele anzeigen
    onValue(matchesRef, (snapshot) => {
        const upcomingMatches = document.getElementById("upcomingMatches");
        const resultsTable = document.getElementById("resultsTable");
        upcomingMatches.innerHTML = "";
        resultsTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const matchId = childSnapshot.key;
            if (match.score === "-") {
                upcomingMatches.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><input type="text" id="score_${matchId}" placeholder="z.B. 3:2"></td>
                    <td><button onclick="saveResult('${matchId}')">Speichern</button></td>
                </tr>`;
            } else {
                resultsTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>${match.score}</td>
                    <td><button onclick="editResult('${matchId}', '${match.score}')">✏️</button></td>
                </tr>`;
            }
        });

        updateRankings();
    });

    // Ergebnis speichern
    window.saveResult = (matchId) => {
        const scoreInput = document.getElementById(`score_${matchId}`).value;
        if (!scoreInput.match(/^\d+:\d+$/)) {
            alert("Ungültiges Format! Bitte im Format X:Y eingeben.");
            return;
        }
        update(ref(db, `matches/${matchId}`), { score: scoreInput });
        updateRankings();
    };

    // Ergebnis bearbeiten
    window.editResult = (matchId, oldScore) => {
        const newScore = prompt("Neues Ergebnis eingeben:", oldScore);
        if (newScore && newScore.match(/^\d+:\d+$/)) {
            update(ref(db, `matches/${matchId}`), { score: newScore });
            updateRankings();
        }
    };

    // Rangliste berechnen
    function updateRankings() {
        onValue(matchesRef, (snapshot) => {
            const rankings = {};

            onValue(teamsRef, (teamsSnapshot) => {
                teamsSnapshot.forEach((childSnapshot) => {
                    const team = childSnapshot.val().name;
                    rankings[team] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
                });

                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    if (match.score !== "-") {
                        const [g1, g2] = match.score.split(":").map(Number);
                        if (rankings[match.team1] && rankings[match.team2]) {
                            rankings[match.team1].games++;
                            rankings[match.team2].games++;
                            rankings[match.team1].goals += g1;
                            rankings[match.team2].goals += g2;
                            rankings[match.team1].conceded += g2;
                            rankings[match.team2].conceded += g1;
                            rankings[match.team1].diff = rankings[match.team1].goals - rankings[match.team1].conceded;
                            rankings[match.team2].diff = rankings[match.team2].goals - rankings[match.team2].conceded;

                            if (g1 > g2) rankings[match.team1].points += 3;
                            else if (g2 > g1) rankings[match.team2].points += 3;
                            else {
                                rankings[match.team1].points += 1;
                                rankings[match.team2].points += 1;
                            }
                        }
                    }
                });

                set(rankingRef, rankings);
            });
        });
    }

    // Rangliste anzeigen
    onValue(rankingRef, (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        if (!snapshot.exists()) return;
        const sortedTeams = Object.keys(snapshot.val()).sort((a, b) =>
            snapshot.val()[b].points - snapshot.val()[a].points ||
            snapshot.val()[b].diff - snapshot.val()[a].diff ||
            snapshot.val()[b].goals - snapshot.val()[a].goals
        );

        sortedTeams.forEach((team, index) => {
            const teamData = snapshot.val()[team];
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
});
