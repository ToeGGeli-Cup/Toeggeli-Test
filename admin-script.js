import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");
    const newsRef = ref(db, "news");

    // Teams anzeigen
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

        if (teams.length > 1) {
            generateMatches(teams);
        }
    });

    // Teams löschen
    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`)).then(() => {
            // Entfernt alle Spiele mit diesem Team
            onValue(matchesRef, (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    if (match.team1 === teamId || match.team2 === teamId) {
                        remove(ref(db, `matches/${childSnapshot.key}`));
                    }
                });
            }, { onlyOnce: true });
        });
    };

    // Teams hinzufügen
    window.addTeam = () => {
        const teamName = document.getElementById("teamName").value.trim();
        const player1 = document.getElementById("player1").value.trim();
        const player2 = document.getElementById("player2").value.trim();

        if (!teamName || !player1 || !player2) {
            alert("Alle Felder müssen ausgefüllt werden!");
            return;
        }

        const newTeamRef = push(teamsRef);
        set(newTeamRef, {
            name: teamName,
            player1: player1,
            player2: player2
        });

        document.getElementById("teamName").value = "";
        document.getElementById("player1").value = "";
        document.getElementById("player2").value = "";
    };

    // Spiele generieren (Round-Robin)
    function generateMatches(teams) {
        onValue(matchesRef, (snapshot) => {
            const existingMatches = snapshot.val() || {};
            const matches = { ...existingMatches };

            for (let i = 0; i < teams.length; i++) {
                for (let j = i + 1; j < teams.length; j++) {
                    const matchId = `${teams[i]}_vs_${teams[j]}`;
                    if (!matches[matchId]) {
                        matches[matchId] = {
                            team1: teams[i],
                            team2: teams[j],
                            score: "-"
                        };
                    }
                }
            }

            set(matchesRef, matches);
        }, { onlyOnce: true });
    }

    // News verwalten
    onValue(newsRef, (snapshot) => {
        const newsList = document.getElementById("newsList");
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsText = childSnapshot.val();
            newsList.innerHTML += `<p>${newsText} <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></p>`;
        });
    });

    window.addNews = () => {
        const newsText = document.getElementById("newsText").value.trim();
        if (!newsText) return;
        push(newsRef, newsText);
        document.getElementById("newsText").value = "";
    };

    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };
});
