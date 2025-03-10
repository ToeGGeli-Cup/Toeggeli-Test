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
        }
    });

    // Teams anzeigen und löschen
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

    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
    };

    // News hinzufügen
    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
        }
    });

    // News anzeigen und löschen
    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text} 
                <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></p>`;
        });
    });

    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };

    // Offene Spiele generieren
    function generateMatches(teams) {
        const matchList = [];
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                matchList.push({ team1: teams[i], team2: teams[j], score: "-" });
            }
        }
        return matchList;
    }

    // Spiele laden
    onValue(teamsRef, (snapshot) => {
        const teams = [];
        snapshot.forEach((childSnapshot) => {
            teams.push(childSnapshot.val().name);
        });

        if (teams.length > 1) {
            const generatedMatches = generateMatches(teams);
            set(matchesRef, generatedMatches);
        }
    });

    // Spiele anzeigen und Ergebnisse verwalten
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
                    <td><input type="text" id="score-${childSnapshot.key}" value="${match.score}"></td>
                    <td><button onclick="updateMatch('${childSnapshot.key}')">Speichern</button></td>
                </tr>`;
            } else {
                upcomingTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><input type="text" id="score-${childSnapshot.key}" placeholder="z.B. 2:1"></td>
                    <td><button onclick="updateMatch('${childSnapshot.key}')">Speichern</button></td>
                </tr>`;
            }
        });
    });

    window.updateMatch = (matchId) => {
        const scoreInput = document.getElementById(`score-${matchId}`);
        if (scoreInput) {
            set(ref(db, `matches/${matchId}/score`), scoreInput.value);
        }
    };
});
