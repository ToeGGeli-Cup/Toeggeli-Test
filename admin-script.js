import { db, ref, push, set, remove, onValue } from "./firebase.js";

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

    // Spiele anzeigen (Offene & Resultate)
    onValue(matchesRef, (snapshot) => {
        const resultsTable = document.getElementById("resultsTable");
        const upcomingTable = document.getElementById("upcomingMatches");
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

    // Ergebnis speichern
    document.getElementById("saveResult").addEventListener("click", () => {
        const team1 = document.getElementById("resultTeam1").value;
        const team2 = document.getElementById("resultTeam2").value;
        const score = document.getElementById("matchScore").value;

        if (team1 && team2) {
            const matchRef = ref(db, `matches/${team1}_${team2}`);
            set(matchRef, { team1, team2, score: score || "-" });
        }
    });

});
