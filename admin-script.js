import { db, ref, onValue, set, push, remove, update } from "./firebase.js";

// Referenzen für HTML-Elemente
const newsList = document.getElementById("newsList");
const teamsList = document.getElementById("teamsList");
const matchesList = document.getElementById("matchesList");
const rankingTable = document.getElementById("rankingTable");

const newsInput = document.getElementById("newsInput");
const teamInput = document.getElementById("teamInput");
const team1Select = document.getElementById("team1Select");
const team2Select = document.getElementById("team2Select");

// News abrufen und anzeigen
onValue(ref(db, "news"), (snapshot) => {
    newsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const newsKey = childSnapshot.key;
        const newsData = childSnapshot.val();
        const newsItem = document.createElement("li");
        newsItem.innerHTML = `${newsData} <button onclick="deleteNews('${newsKey}')">🗑️</button>`;
        newsList.appendChild(newsItem);
    });
});

// News hinzufügen
window.addNews = function () {
    const newNews = newsInput.value.trim();
    if (newNews) {
        push(ref(db, "news"), newNews);
        newsInput.value = "";
    }
};

// News löschen
window.deleteNews = function (newsKey) {
    remove(ref(db, `news/${newsKey}`));
};

// Teams abrufen und anzeigen
onValue(ref(db, "teams"), (snapshot) => {
    teamsList.innerHTML = "";
    team1Select.innerHTML = "";
    team2Select.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
        const teamName = childSnapshot.val();
        const teamKey = childSnapshot.key;

        const teamItem = document.createElement("li");
        teamItem.innerHTML = `${teamName} <button onclick="deleteTeam('${teamKey}')">🗑️</button>`;
        teamsList.appendChild(teamItem);

        const option1 = document.createElement("option");
        option1.value = teamName;
        option1.textContent = teamName;
        team1Select.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = teamName;
        option2.textContent = teamName;
        team2Select.appendChild(option2);
    });
});

// Team hinzufügen
window.addTeam = function () {
    const newTeam = teamInput.value.trim();
    if (newTeam) {
        set(ref(db, `teams/${newTeam}`), newTeam);
        teamInput.value = "";
    }
};

// Team löschen
window.deleteTeam = function (teamKey) {
    remove(ref(db, `teams/${teamKey}`));
};

// Matches abrufen und anzeigen
onValue(ref(db, "matches"), (snapshot) => {
    matchesList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const matchKey = childSnapshot.key;
        const matchData = childSnapshot.val();
        const matchItem = document.createElement("li");
        matchItem.innerHTML = `${matchData.team1} vs. ${matchData.team2} - ${matchData.score || "Offen"} 
            <button onclick="deleteMatch('${matchKey}')">🗑️</button>`;
        matchesList.appendChild(matchItem);
    });
});

// Match hinzufügen
window.addMatch = function () {
    const team1 = team1Select.value;
    const team2 = team2Select.value;

    if (team1 && team2 && team1 !== team2) {
        const newMatchRef = ref(db, `matches/${team1}_vs_${team2}`);
        set(newMatchRef, { team1, team2, score: null });
    }
};

// Match löschen
window.deleteMatch = function (matchKey) {
    remove(ref(db, `matches/${matchKey}`));
};

// Ergebnisse abrufen und Rangliste anzeigen
onValue(ref(db, "ranking"), (snapshot) => {
    rankingTable.innerHTML = "";
    let rankingData = [];

    snapshot.forEach((childSnapshot) => {
        const teamName = childSnapshot.key;
        const stats = childSnapshot.val();
        rankingData.push({
            team: teamName,
            games: stats.games || 0,
            points: stats.points || 0,
            goals: stats.goals || 0,
            conceded: stats.conceded || 0,
            diff: stats.diff || 0,
        });
    });

    rankingData.sort((a, b) => b.points - a.points);

    rankingData.forEach((team, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${index + 1}</td><td>${team.team}</td><td>${team.games}</td><td>${team.points}</td><td>${team.goals}</td><td>${team.conceded}</td><td>${team.diff}</td>`;
        rankingTable.appendChild(row);
    });
});
