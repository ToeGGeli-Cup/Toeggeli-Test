import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");
    const newsRef = ref(db, "news");

    // Teams anzeigen und verwalten
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

    window.addTeam = () => {
        const teamName = document.getElementById("teamName").value.trim();
        const player1 = document.getElementById("player1").value.trim();
        const player2 = document.getElementById("player2").value.trim();

        if (!teamName || !player1 || !player2) {
            alert("Bitte alle Felder ausfüllen.");
            return;
        }

        const newTeamRef = push(teamsRef);
        set(newTeamRef, { name: teamName, player1: player1, player2: player2 });

        document.getElementById("teamName").value = "";
        document.getElementById("player1").value = "";
        document.getElementById("player2").value = "";
    };

    window.deleteTeam = (teamId) => {
        onValue(ref(db, `teams/${teamId}`), (snapshot) => {
            if (snapshot.exists()) {
                const teamName = snapshot.val().name;

                remove(ref(db, `teams/${teamId}`));

                onValue(matchesRef, (matchesSnap) => {
                    matchesSnap.forEach((matchSnapshot) => {
                        const match = matchSnapshot.val();
                        if (match.team1 === teamName || match.team2 === teamName) {
                            remove(ref(db, `matches/${matchSnapshot.key}`));
                        }
                    });
                });

                updateRankings();
            }
        }, { onlyOnce: true });
    };

    function generateMatches(teams) {
        onValue(matchesRef, (snapshot) => {
            const existingMatches = {};
            snapshot.forEach((childSnapshot) => {
                existingMatches[childSnapshot.key] = childSnapshot.val();
            });

            const newMatches = {};
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

            set(matchesRef, { ...existingMatches, ...newMatches });
        }, { onlyOnce: true });
    }

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

    // News verwalten
    onValue(newsRef, (snapshot) => {
        const newsList = document.getElementById("newsList");
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsList.innerHTML += `<li>${newsItem} <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></li>`;
        });
    });

    window.addNews = () => {
        const newsText = document.getElementById("newsInput").value.trim();
        if (!newsText) return;

        const newNewsRef = push(newsRef);
        set(newNewsRef, newsText);

        document.getElementById("newsInput").value = "";
    };

    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };

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
