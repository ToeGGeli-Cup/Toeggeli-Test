import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

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

    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text}</p>`;
        });
    });

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
    });
});
