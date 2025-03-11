import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const newsRef = ref(db, "news");
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");

    // Newsverwaltung
    const newsInput = document.getElementById("newsInput");
    const newsList = document.getElementById("newsList");

    document.getElementById("addNewsBtn").addEventListener("click", () => {
        if (newsInput.value.trim()) {
            push(newsRef, newsInput.value);
            newsInput.value = "";
        }
    });

    onValue(newsRef, (snapshot) => {
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const li = document.createElement("li");
            li.innerHTML = `${childSnapshot.val()} <button onclick="remove(ref(db, 'news/${childSnapshot.key}'))">🗑️</button>`;
            newsList.appendChild(li);
        });
    });

    // Teamsverwaltung
    document.getElementById("addTeamBtn").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value.trim();
        const player1 = document.getElementById("player1").value.trim();
        const player2 = document.getElementById("player2").value.trim();

        if (teamName && player1 && player2) {
            push(teamsRef, { name: teamName, player1, player2 });
        }
    });

    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teamsTable.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
                <td><button onclick="remove(ref(db, 'teams/${childSnapshot.key}'))">🗑️</button></td>
            </tr>`;
        });
    });

    // Spiele generieren ohne Resultate zu löschen
    onValue(teamsRef, (snapshot) => {
        const teams = [];
        snapshot.forEach((childSnapshot) => {
            teams.push(childSnapshot.val().name);
        });

        onValue(matchesRef, (matchSnapshot) => {
            const matches = matchSnapshot.val() || {};
            teams.forEach((team1, i) => {
                teams.forEach((team2, j) => {
                    if (i < j) {
                        const matchId = `${team1}_vs_${team2}`;
                        if (!matches[matchId]) {
                            matches[matchId] = { team1, team2, score: "-" };
                        }
                    }
                });
            });
            set(matchesRef, matches);
        });
    });

    // Spiele anzeigen
    onValue(matchesRef, (snapshot) => {
        const upcomingMatches = document.getElementById("upcomingMatches");
        const resultsTable = document.getElementById("resultsTable");
        upcomingMatches.innerHTML = "";
        resultsTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const matchId = childSnapshot.key;
            if (match.score === "-") {
                upcomingMatches.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><input type="text" id="score_${matchId}" placeholder="3:2"></td>
                    <td><button onclick="update(ref(db, 'matches/${matchId}'), { score: document.getElementById('score_' + matchId).value })">Speichern</button></td>
                </tr>`;
            } else {
                resultsTable.innerHTML += `<tr><td>${match.team1}</td><td>${match.team2}</td><td>${match.score}</td></tr>`;
            }
        });
    });
});
