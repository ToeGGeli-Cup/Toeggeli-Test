import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const newsRef = ref(db, "news");
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");

    // News anzeigen
    onValue(newsRef, (snapshot) => {
        const newsList = document.getElementById("newsList");
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsList.innerHTML += `<li>${newsItem}</li>`;
        });
    });

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
            upcomingMatches.innerHTML += `<tr>
                <td>${match.team1}</td>
                <td>${match.team2}</td>
            </tr>`;
        });
    });

    // Rangliste anzeigen
    onValue(rankingRef, (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.key;
            const data = childSnapshot.val();
            rankingTable.innerHTML += `<tr>
                <td>${team}</td>
                <td>${data.games}</td>
                <td>${data.points}</td>
                <td>${data.goals}</td>
                <td>${data.conceded}</td>
                <td>${data.diff}</td>
            </tr>`;
        });
    });
});
