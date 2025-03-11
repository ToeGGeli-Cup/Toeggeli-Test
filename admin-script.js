import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");
    const newsRef = ref(db, "news");

    // TEAMS VERWALTEN
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

    window.addTeam = () => {
        const teamName = document.getElementById("teamName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;
        if (teamName && player1 && player2) {
            push(teamsRef, { name: teamName, player1, player2 });
            document.getElementById("teamName").value = "";
            document.getElementById("player1").value = "";
            document.getElementById("player2").value = "";
        }
    };

    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
    };

    // NEWS VERWALTEN
    onValue(newsRef, (snapshot) => {
        const newsTable = document.getElementById("newsTable");
        newsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const news = childSnapshot.val();
            newsTable.innerHTML += `<tr>
                <td>${news.text}</td>
                <td><button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></td>
            </tr>`;
        });
    });

    window.addNews = () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            push(newsRef, { text: newsText });
            document.getElementById("newsText").value = "";
        }
    };

    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };

    // SPIELE VERWALTEN (MANUELLES HINZUFÜGEN/ENTFERNEN)
    onValue(matchesRef, (snapshot) => {
        const matchesTable = document.getElementById("matchesTable");
        matchesTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            matchesTable.innerHTML += `<tr>
                <td>${match.team1}</td>
                <td>${match.team2}</td>
                <td>${match.score || "-"}</td>
                <td><button onclick="deleteMatch('${childSnapshot.key}')">🗑️</button></td>
            </tr>`;
        });

        updateRankings();
    });

    window.addMatch = () => {
        const team1 = document.getElementById("matchTeam1").value;
        const team2 = document.getElementById("matchTeam2").value;
        if (team1 && team2 && team1 !== team2) {
            push(matchesRef, { team1, team2, score: "-" });
        }
    };

    window.deleteMatch = (matchId) => {
        remove(ref(db, `matches/${matchId}`));
    };

    window.saveResult = (matchId) => {
        const scoreInput = document.getElementById(`score_${matchId}`).value;
        if (!scoreInput.match(/^\d+:\d+$/)) {
            alert("Ungültiges Format! Bitte im Format X:Y eingeben.");
            return;
        }
        update(ref(db, `matches/${matchId}`), { score: scoreInput });
        updateRankings();
    };

    // RANGLISTE BERECHNEN
    function updateRankings() {
        onValue(matchesRef, (snapshot) => {
            const rankings = {};
            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                if (match.score !== "-") {
                    const [g1, g2] = match.score.split(":").map(Number);
                    rankings[match.team1] = rankings[match.team1] || { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
                    rankings[match.team2] = rankings[match.team2] || { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };

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
            });

            set(rankingRef, rankings);
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
});
