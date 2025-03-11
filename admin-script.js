import { db, ref, push, set, remove, update, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");

    // **TEAMS VERWALTEN**
    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teamsTable.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
                <td><button onclick="deleteTeam('${childSnapshot.key}')">🗑️</button></td>
            </tr>`;
        });
    });

    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value.replace(/[^a-zA-Z0-9_-]/g, "");
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;

        if (teamName && player1 && player2) {
            const newTeamRef = push(teamsRef);
            set(newTeamRef, { name: teamName, player1, player2 });
        }
    });

    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
    };

    // **NEWS VERWALTEN**
    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text} 
                <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></p>`;
        });
    });

    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
        }
    });

    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };

    // **SPIELE MANUELL VERWALTEN**
    document.getElementById("addMatch").addEventListener("click", () => {
        const team1 = document.getElementById("matchTeam1").value;
        const team2 = document.getElementById("matchTeam2").value;

        if (team1 && team2 && team1 !== team2) {
            const newMatchRef = push(matchesRef);
            set(newMatchRef, { team1, team2, score: "-" });
        }
    });

    onValue(matchesRef, (snapshot) => {
        const upcomingTable = document.getElementById("upcomingMatches");
        const resultsTable = document.getElementById("resultsTable");
        upcomingTable.innerHTML = "";
        resultsTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const matchId = childSnapshot.key;

            if (match.score && match.score !== "-") {
                resultsTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><input type="text" id="score_${matchId}" value="${match.score}" style="width: 50px;">
                        <button onclick="updateScore('${matchId}')">Speichern</button>
                        <button onclick="deleteMatch('${matchId}')">🗑️</button>
                    </td>
                </tr>`;
            } else {
                upcomingTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><input type="text" id="score_${matchId}" placeholder="Ergebnis">
                        <button onclick="updateScore('${matchId}')">Speichern</button>
                        <button onclick="deleteMatch('${matchId}')">🗑️</button>
                    </td>
                </tr>`;
            }
        });
    });

    window.deleteMatch = (matchId) => {
        remove(ref(db, `matches/${matchId}`));
    };

    window.updateScore = (matchId) => {
        const score = document.getElementById(`score_${matchId}`).value;
        if (!score.match(/^\d+:\d+$/)) {
            alert("Ungültiges Format! Bitte im Format X:Y eingeben.");
            return;
        }
        update(ref(db, `matches/${matchId}`), { score });
        updateRankings();
    };

    // **RANGLISTE BERECHNEN**
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

    onValue(matchesRef, updateRankings);
});
