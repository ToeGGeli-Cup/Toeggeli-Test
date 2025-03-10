import { db, ref, push, set, remove, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // ✅ TEAMS HINZUFÜGEN
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

    // ✅ TEAMS LADEN UND ANZEIGEN
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

    // ✅ TEAM LÖSCHEN
    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
        alert("Team gelöscht!");
    };

    // ✅ NEWS HINZUFÜGEN
    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
            alert("News erfolgreich hinzugefügt!");
        }
    });

    // ✅ NEWS LADEN UND ANZEIGEN
    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text} 
                <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></p>`;
        });
    });

    // ✅ NEWS LÖSCHEN
    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
        alert("News gelöscht!");
    };

    // ✅ SPIELE HINZUFÜGEN
    document.getElementById("addMatch").addEventListener("click", () => {
        const team1 = document.getElementById("team1").value;
        const team2 = document.getElementById("team2").value;

        if (team1 && team2) {
            const newMatchRef = push(matchesRef);
            set(newMatchRef, { team1: team1, team2: team2, score: "-" });
            alert("Spiel erfolgreich hinzugefügt!");
        }
    });

    // ✅ OFFENE SPIELE LADEN UND ANZEIGEN
    onValue(matchesRef, (snapshot) => {
        const upcomingMatches = document.getElementById("upcomingMatches");
        const matchSelect = document.getElementById("matchSelect");
        upcomingMatches.innerHTML = "";
        matchSelect.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score === "-") {
                upcomingMatches.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                </tr>`;
                matchSelect.innerHTML += `<option value="${childSnapshot.key}">${match.team1} vs ${match.team2}</option>`;
            }
        });
    });

    // ✅ ERGEBNIS SPEICHERN
    document.getElementById("saveResult").addEventListener("click", () => {
        const matchId = document.getElementById("matchSelect").value;
        const matchScore = document.getElementById("matchScore").value;

        if (matchId && matchScore) {
            set(ref(db, `matches/${matchId}/score`), matchScore);
            alert("Ergebnis gespeichert!");
        }
    });

    // ✅ RESULTATE LADEN UND ANZEIGEN
    onValue(matchesRef, (snapshot) => {
        const resultsTable = document.getElementById("resultsTable");
        resultsTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score !== "-") {
                resultsTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>${match.score}</td>
                </tr>`;
            }
        });

        updateRankings(snapshot);
    });

    // ✅ RANGLISTE BERECHNEN UND ANZEIGEN
    function updateRankings(snapshot) {
        const rankings = {};

        // Teams initialisieren
        onValue(teamsRef, (teamsSnapshot) => {
            teamsSnapshot.forEach((childSnapshot) => {
                const team = childSnapshot.val().name;
                rankings[team] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            });

            snapshot.forEach((childSnapshot) => {
                const match = childSnapshot.val();
                if (match.score !== "-") {
                    const [g1, g2] = match.score.split(":").map(Number);
                    
                    rankings[match.team1].games += 1;
                    rankings[match.team2].games += 1;
                    rankings[match.team1].goals += g1;
                    rankings[match.team2].goals += g2;
                    rankings[match.team1].conceded += g2;
                    rankings[match.team2].conceded += g1;
                    rankings[match.team1].diff = rankings[match.team1].goals - rankings[match.team1].conceded;
                    rankings[match.team2].diff = rankings[match.team2].goals - rankings[match.team2].conceded;

                    // Punktevergabe
                    if (g1 > g2) rankings[match.team1].points += 1;
                    else if (g2 > g1) rankings[match.team2].points += 1;
                }
            });

            // Rangliste sortieren
            const rankingTable = document.getElementById("rankingTable");
            rankingTable.innerHTML = "";
            const sortedTeams = Object.keys(rankings).sort((a, b) =>
                rankings[b].points - rankings[a].points ||
                rankings[b].diff - rankings[a].diff ||
                rankings[b].goals - rankings[a].goals
            );

            sortedTeams.forEach((team, index) => {
                rankingTable.innerHTML += `<tr>
                    <td>${index + 1}</td>
                    <td>${team}</td>
                    <td>${rankings[team].games}</td>
                    <td>${rankings[team].points}</td>
                    <td>${rankings[team].goals}</td>
                    <td>${rankings[team].conceded}</td>
                    <td>${rankings[team].diff}</td>
                </tr>`;
            });
        });
    }
});
