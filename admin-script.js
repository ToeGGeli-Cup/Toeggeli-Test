import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");
    const newsRef = ref(db, "news");

    // Teams anzeigen und aktualisieren
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
            generateMatches(teams);
        }
    });

    // Team hinzufügen
    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value.trim();
        const player1 = document.getElementById("player1").value.trim();
        const player2 = document.getElementById("player2").value.trim();

        if (!teamName || !player1 || !player2) {
            alert("Bitte alle Felder ausfüllen!");
            return;
        }

        const newTeamRef = push(teamsRef);
        set(newTeamRef, { name: teamName, player1, player2 });

        document.getElementById("teamName").value = "";
        document.getElementById("player1").value = "";
        document.getElementById("player2").value = "";
    });

    // Team löschen (inkl. verbundene Spiele entfernen)
    window.deleteTeam = (teamId) => {
        onValue(teamsRef, (snapshot) => {
            const team = snapshot.child(teamId).val();
            if (team) {
                remove(ref(db, `teams/${teamId}`));

                onValue(matchesRef, (matchSnapshot) => {
                    matchSnapshot.forEach((matchChild) => {
                        const match = matchChild.val();
                        if (match.team1 === team.name || match.team2 === team.name) {
                            remove(ref(db, `matches/${matchChild.key}`));
                        }
                    });
                });
            }
        });
    };

    // Spiele generieren (Round-Robin)
    function generateMatches(teams) {
        onValue(matchesRef, (snapshot) => {
            const existingMatches = snapshot.val() || {};
            const matches = { ...existingMatches };

            teams.forEach((team1, i) => {
                teams.forEach((team2, j) => {
                    if (i < j) {
                        const matchId = `${team1}_vs_${team2}`;
                        if (!matches[matchId]) {
                            matches[matchId] = { team1, team2, score: "-" };
                        }
                    }
                });
            });

            set(matchesRef, matches);
        });
    }

    // Spiele und Resultate verwalten
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

    // Rangliste aktualisieren
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
