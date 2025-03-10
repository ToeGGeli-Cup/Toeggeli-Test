import { db, ref, onValue } from "./firebase.js";

function loadTournamentData() {
    onValue(ref(db, "news"), (snapshot) => {
        const newsContainer = document.getElementById("news");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = document.createElement("p");
            newsItem.textContent = childSnapshot.val();
            newsContainer.appendChild(newsItem);
        });
    });

    onValue(ref(db, "teams"), (snapshot) => {
        const teamsTable = document.getElementById("teams");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teamsTable.innerHTML += `<tr><td>${team.name}</td><td>${team.player1}</td><td>${team.player2}</td></tr>`;
        });
    });
}

loadTournamentData();
