import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");
    const newsRef = ref(db, "news");

    function sanitizeKey(key) {
        return key.replace(/[^a-zA-Z0-9]/g, "_"); // Entfernt unerlaubte Zeichen für Firebase-Keys
    }

    // NEWS VERWALTEN
    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text}
                <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></p>`;
        });
    });

    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };

    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
            document.getElementById("newsText").value = "";
        }
    });

    // TEAMS VERWALTEN
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
                <td><button onclick="deleteTeam('${childSnapshot.key}', '${team.name}')">🗑️</button></td>
            </tr>`;
        });

        if (teams.length > 1) {
            generateMatches(teams);
        }
    });

    window.deleteTeam = (teamId, teamName) => {
        remove(ref(db, `teams/${teamId}`)).then(() => {
            removeTeamMatches(teamName);
        });
    };

    function removeTeamMatches(teamName) {
        onValue(matchesRef, (snapshot) => {
            const updates = {};
            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                if (match.team1 === teamName || match.team2 === teamName) {
                    updates[childSnapshot.key] = null;
                }
            });

            if (Object.keys(updates).length > 0) {
                update(matchesRef, updates).then(() => {
                    updateRankings(); // Rangliste aktualisieren nach Löschung
                });
            }
        }, { onlyOnce: true });
    }

    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;

        if (teamName && player1 && player2) {
            const newTeamRef = push(teamsRef);
            set(newTeamRef, { name: teamName, player1: player1, player2: player2 });
            document.getElementById("teamName").value = "";
            document.getElementById("player1").value = "";
            document.getElementById("player2").value = "";
        }
    });

    function generateMatches(teams) {
        onValue(matchesRef, (snapshot) => {
            const existingMatches = snapshot.val() || {};
            const matches = { ...existingMatches };

            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const matchId = `${sanitizeKey(teams[i])}_vs_${sanitizeKey(teams[j])}`;
                    if (!matches[matchId]) {
                        matches[matchId] = { team1: teams[i], team2: teams[j], score: "-" };
                    }
                }
            }

            set(matchesRef, matches);
        }, { onlyOnce: true });
    }

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

    window.saveResult = (matchId) => {
        const scoreInput = document.getElementById(`score_${matchId}`).value;
        if (!scoreInput.match(/^\d+:\d+$/)) {
            alert("Ungültiges Format! Bitte im Format X:Y eingeben.");
            return;
        }
        update(ref(db, `matches/${matchId}`), { score: scoreInput });
        updateRankings();
    };

    window.editResult = (matchId, oldScore) => {
        const newScore = prompt("Neues Ergebnis eingeben:", oldScore);
        if (newScore && newScore.match(/^\d+:\d+$/)) {
            update(ref(db, `matches/${matchId}`), { score: newScore });
            updateRankings();
        }
    };

    function updateRankings() {
        onValue(matchesRef, (snapshot) => {
            const rankings = {};

            onValue(teamsRef, (teamsSnapshot) => {
                teamsSnapshot.forEach((childSnapshot) => {
                    const team = sanitizeKey(childSnapshot.val().name);
                    rankings[team] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
                });

                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    if (match.score !== "-") {
                        const [g1, g2] = match.score.split(":").map(Number);
                        const team1 = sanitizeKey(match.team1);
                        const team2 = sanitizeKey(match.team2);

                        if (rankings[team1] && rankings[team2]) {
                            rankings[team1].games++;
                            rankings[team2].games++;
                            rankings[team1].goals += g1;
                            rankings[team2].goals += g2;
                            rankings[team1].conceded += g2;
                            rankings[team2].conceded += g1;
                            rankings[team1].diff = rankings[team1].goals - rankings[team1].conceded;
                            rankings[team2].diff = rankings[team2].goals - rankings[team2].conceded;

                            if (g1 > g2) rankings[team1].points += 3;
                            else if (g2 > g1) rankings[team2].points += 3;
                            else {
                                rankings[team1].points += 1;
                                rankings[team2].points += 1;
                            }
                        }
                    }
                });

                set(rankingRef, rankings);
            });
        });
    }
});
