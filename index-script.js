import { db, ref, onValue } from "./firebase.js";

// News abrufen
onValue(ref(db, "news"), snapshot => {
    const newsContainer = document.getElementById("news");
    newsContainer.innerHTML = "";
    snapshot.forEach(childSnapshot => {
        const news = childSnapshot.val();
        newsContainer.innerHTML += `<p><strong>${news.date}:</strong> ${news.text}</p>`;
    });
});

// Teams abrufen
onValue(ref(db, "teams"), snapshot => {
    const teamsTable = document.getElementById("teams");
    teamsTable.innerHTML = "";
    snapshot.forEach(childSnapshot => {
        const team = childSnapshot.val();
        teamsTable.innerHTML += `<tr><td>${childSnapshot.key}</td><td>${team.player1}</td><td>${team.player2}</td></tr>`;
    });
});

// Ergebnisse abrufen
onValue(ref(db, "matches"), snapshot => {
    const resultsTable = document.getElementById("results");
    resultsTable.innerHTML = "";
    snapshot.forEach(childSnapshot => {
        const match = childSnapshot.val();
        if (match.score !== "-") {
            resultsTable.innerHTML += `<tr><td>${match.team1}</td><td>${match.team2}</td><td>${match.score}</td></tr>`;
        }
    });

    const upcomingTable = document.getElementById("upcoming");
    upcomingTable.innerHTML = "";
    snapshot.forEach(childSnapshot => {
        const match = childSnapshot.val();
        if (match.score === "-") {
            upcomingTable.innerHTML += `<tr><td>${match.team1}</td><td>${match.team2}</td></tr>`;
        }
    });
});

// Rangliste abrufen und sortieren
onValue(ref(db, "teams"), snapshot => {
    let rankings = {};
    snapshot.forEach(childSnapshot => {
        rankings[childSnapshot.key] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
    });

    onValue(ref(db, "matches"), snapshot => {
        snapshot.forEach(childSnapshot => {
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
                if (g1 > g2) rankings[match.team1].points += 1;
                else if (g2 > g1) rankings[match.team2].points += 1;
            }
        });

        const rankingTable = document.getElementById("ranking");
        rankingTable.innerHTML = "";
        Object.entries(rankings).sort((a, b) => b[1].points - a[1].points || b[1].diff - a[1].diff || b[1].goals - a[1].goals).forEach((team, index) => {
            rankingTable.innerHTML += `<tr><td>${index + 1}</td><td>${team[0]}</td><td>${team[1].games}</td><td>${team[1].points}</td><td>${team[1].goals}</td><td>${team[1].conceded}</td><td>${team[1].diff}</td></tr>`;
        });
    });
});
