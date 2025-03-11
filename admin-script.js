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
            generateMatches(teams);
        }
    });

    // Teams löschen + zugehörige Spiele entfernen
    window.deleteTeam = (teamId) => {
        const teamRef = ref(db, `teams/${teamId}`);

        // Team entfernen
        remove(teamRef).then(() => {
            console.log("Team gelöscht:", teamId);

            // Alle Spiele löschen, an denen das Team beteiligt war
            onValue(matchesRef, (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    const matchId = childSnapshot.key;
                    if (match.team1 === teamId || match.team2 === teamId) {
                        remove(ref(db, `matches/${matchId}`));
                        console.log("Spiel gelöscht:", matchId);
                    }
                });
            }, { onlyOnce: true });

            updateRankings(); // Rangliste aktualisieren
        });
    };

    // Spiele generieren (Round-Robin)
    function generateMatches(teams) {
        const matches = {};
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const matchId = `${teams[i]}_vs_${teams[j]}`;
                matches[matchId] = {
                    team1: teams[i],
                    team2: teams[j],
                    score: "-"
                };
            }
        }
        set(matchesRef, matches);
    }

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
});
