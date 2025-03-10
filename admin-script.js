import { db, ref, push, set, remove, update, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

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
        const teamName = document.getElementById("teamName").value;
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

    // **SPIELE VERWALTEN**
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
                    </td>
                </tr>`;
            } else {
                upcomingTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><input type="text" id="score_${matchId}" placeholder="Ergebnis">
                        <button onclick="updateScore('${matchId}')">Speichern</button>
                    </td>
                </tr>`;
            }
        });
    });

    window.updateScore = (matchId) => {
        const scoreInput = document.getElementById(`score_${matchId}`);
        const newScore = scoreInput.value.trim();

        if (newScore === "") {
            update(ref(db, `matches/${matchId}`), { score: "-" });
        } else {
            update(ref(db, `matches/${matchId}`), { score: newScore });
        }
    };

    // **RANGLISTE BERECHNEN**
    function updateRankings(snapshot) {
        const rankings = {};

        onValue(teamsRef, (teamsSnapshot) => {
            teamsSnapshot.forEach((childSnapshot) => {
                const team = childSnapshot.val().name;
                rankings[team] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            });

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

                    if (g1 > g2) rankings[match.team1].points += 1;
                    else if (g2 > g1) rankings[match.team2].points += 1;
                }
            });

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

    onValue(matchesRef, updateRankings);
});
