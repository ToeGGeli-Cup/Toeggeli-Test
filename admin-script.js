import { db, ref, push, set, remove, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // Teams anzeigen & verwalten
    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        const teams = [];

        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teams.push(team.name);
            teamsTable.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
                <td><button onclick="deleteTeam('${childSnapshot.key}')">🗑️</button></td>
            </tr>`;
        });

        generateMatches(teams);
    });

    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
    };

    // News anzeigen und verwalten
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

    // Spiele anzeigen & Resultate verwalten
    onValue(matchesRef, (snapshot) => {
        const matchesTable = document.getElementById("matchesTable");
        matchesTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            matchesTable.innerHTML += `<tr>
                <td>${match.team1}</td>
                <td>${match.team2}</td>
                <td>
                    <input type="text" id="result_${childSnapshot.key}" value="${match.score !== '-' ? match.score : ''}">
                    <button onclick="saveResult('${childSnapshot.key}')">Speichern</button>
                </td>
            </tr>`;
        });
    });

    window.saveResult = (matchId) => {
        const resultInput = document.getElementById(`result_${matchId}`).value;
        const matchRef = ref(db, `matches/${matchId}`);

        set(matchRef, { ...matchRef, score: resultInput || "-" });
    };

    function generateMatches(teams) {
        if (teams.length < 2) return;

        teams.forEach((team1, i) => {
            for (let j = i + 1; j < teams.length; j++) {
                const team2 = teams[j];
                const matchId = `${team1}_${team2}`;
                set(ref(db, `matches/${matchId}`), { team1, team2, score: "-" });
            }
        });
    }
});
