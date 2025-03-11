import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");
    const newsRef = ref(db, "news");

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

    // Spiele anzeigen
    onValue(matchesRef, (snapshot) => {
        const upcomingMatches = document.getElementById("upcomingMatches");
        upcomingMatches.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score === "-") {
                upcomingMatches.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                </tr>`;
            }
        });
    });

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

    // News anzeigen
    onValue(newsRef, (snapshot) => {
        const newsList = document.getElementById("newsList");
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsText = childSnapshot.val();
            newsList.innerHTML += `<p>${newsText}</p>`;
        });
    });
});
