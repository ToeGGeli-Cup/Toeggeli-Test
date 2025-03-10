import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // Teams anzeigen
    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teamsTable.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
            </tr>`;
        });
    });

    // News anzeigen
    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text}</p>`;
        });
    });

    // Resultate und offene Spiele anzeigen
    onValue(matchesRef, (snapshot) => {
        const resultsTable = document.getElementById("resultsTable");
        const upcomingTable = document.getElementById("upcomingTable");
        resultsTable.innerHTML = "";
        upcomingTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score && match.score !== "-") {
                resultsTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>${match.score}</td>
                </tr>`;
            } else {
                upcomingTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                </tr>`;
            }
        });

        updateRankings(snapshot);
    });

    // Rangliste berechnen
    function updateRankings(snapshot) {
        const rankings = {};

        // Initialisierung aller Teams in der Rangliste
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

                    // Punktevergabe
                    if (g1 > g2) rankings[match.team1].points += 1;
                    else if (g2 > g1) rankings[match.team2].points += 1;
                }
            });

            // Rangliste sortieren und anzeigen
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
