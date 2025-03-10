import { db, ref, push, set, remove, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // Teams hinzufügen
    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;

        if (teamName && player1 && player2) {
            const newTeamRef = push(teamsRef);
            set(newTeamRef, { name: teamName, player1: player1, player2: player2 });
            alert("Team erfolgreich hinzugefügt!");
        }
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
                <td><button onclick="deleteTeam('${childSnapshot.key}')">Löschen</button></td>
            </tr>`;
        });
    });

    // Team löschen
    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
        alert("Team gelöscht!");
    };

    // News hinzufügen
    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
            alert("News erfolgreich hinzugefügt!");
        }
    });

    // News anzeigen
    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text} 
                <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></p>`;
        });
    });

    // News löschen
    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
        alert("News gelöscht!");
    };

    // Offene Spiele hinzufügen
    document.getElementById("addMatch").addEventListener("click", () => {
        const team1 = document.getElementById("matchTeam1").value;
        const team2 = document.getElementById("matchTeam2").value;

        if (team1 && team2) {
            const newMatchRef = push(matchesRef);
            set(newMatchRef, { team1: team1, team2: team2, score: "-" });
            alert("Spiel erfolgreich hinzugefügt!");
        }
    });

    // Offene Spiele und Resultate anzeigen
