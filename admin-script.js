import { db, ref, set, push, remove, onValue } from "./firebase.js";

// News hinzufügen
function addNews() {
    const newsText = document.getElementById("newsInput").value;
    if (newsText.trim() === "") return;
    const newsRef = ref(db, "news/" + Date.now());
    set(newsRef, { text: newsText, date: new Date().toLocaleDateString() });
    document.getElementById("newsInput").value = "";
}

// News anzeigen und löschen
function loadNews() {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    onValue(ref(db, "news"), (snapshot) => {import { db, ref, onValue, push, set, remove, update } from "./firebase.js";

// NEWS LADEN
function loadNews() {
    const newsRef = ref(db, "news");
    onValue(newsRef, (snapshot) => {
        const newsList = document.getElementById("newsList");
        newsList.innerHTML = "";
        snapshot.forEach((child) => {
            const li = document.createElement("li");
            li.textContent = child.val();
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "news/" + child.key));
            li.appendChild(delBtn);
            newsList.appendChild(li);
        });
    });
}

// NEWS HINZUFÜGEN
function addNews() {
    const newsInput = document.getElementById("newsInput").value;
    if (newsInput) {
        push(ref(db, "news"), newsInput);
        document.getElementById("newsInput").value = "";
    }
}

// TEAMS LADEN
function loadTeams() {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
        const teamList = document.getElementById("teamList");
        teamList.innerHTML = "";
        snapshot.forEach((child) => {
            const li = document.createElement("li");
            li.textContent = child.val().name;
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "teams/" + child.key));
            li.appendChild(delBtn);
            teamList.appendChild(li);
        });
    });
}

// TEAMS HINZUFÜGEN
function addTeam() {
    const teamName = document.getElementById("teamName").value;
    if (teamName) {
        push(ref(db, "teams"), { name: teamName, games: 0, points: 0 });
        document.getElementById("teamName").value = "";
    }
}

// SPIELE LADEN
function loadMatches() {
    const matchRef = ref(db, "matches");
    onValue(matchRef, (snapshot) => {
        const matchList = document.getElementById("matchList");
        matchList.innerHTML = "";
        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.teamA} vs ${data.teamB} - ${data.score || "-:-"}`;
            const scoreInput = document.createElement("input");
            scoreInput.placeholder = "Ergebnis (10:5)";
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "✓";
            saveBtn.onclick = () => update(ref(db, "matches/" + child.key), { score: scoreInput.value });
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "matches/" + child.key));
            li.appendChild(scoreInput);
            li.appendChild(saveBtn);
            li.appendChild(delBtn);
            matchList.appendChild(li);
        });
    });
}

// SPIELE HINZUFÜGEN
function addMatch() {
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    if (teamA && teamB) {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" });
        document.getElementById("teamA").value = "";
        document.getElementById("teamB").value = "";
    }
}

// ERGEBNISSE LADEN
function loadResults() {
    const resultList = document.getElementById("resultList");
    resultList.innerHTML = "";
    onValue(ref(db, "matches"), (snapshot) => {
        snapshot.forEach((child) => {
            const data = child.val();
            if (data.score && data.score !== "-:-") {
                const li = document.createElement("li");
                li.textContent = `${data.teamA} vs ${data.teamB} - ${data.score}`;
                resultList.appendChild(li);
            }
        });
    });
}

// RANGLISTE LADEN
function loadRanking() {
    onValue(ref(db, "ranking"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        snapshot.forEach((child) => {
            const data = child.val();
            const row = rankingTable.insertRow();
            row.innerHTML = `<td>${data.rank}</td><td>${data.team}</td><td>${data.games}</td><td>${data.points}</td><td>${data.goals}</td><td>${data.conceded}</td><td>${data.diff}</td>`;
        });
    });
}

// ALLES LADEN
loadNews();
loadTeams();
loadMatches();
loadResults();
loadRanking();

        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            const li = document.createElement("li");
            li.textContent = `${newsItem.date}: ${newsItem.text}`;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Löschen";
            deleteBtn.onclick = () => remove(ref(db, "news/" + childSnapshot.key));
            li.appendChild(deleteBtn);
            newsList.appendChild(li);
        });
    });
}

// Team hinzufügen
function addTeam() {
    const teamName = document.getElementById("teamInput").value;
    if (teamName.trim() === "") return;
    set(ref(db, "teams/" + teamName), { name: teamName });
    document.getElementById("teamInput").value = "";
}

// Teams anzeigen und löschen
function loadTeams() {
    const teamsList = document.getElementById("teamsList");
    const team1Select = document.getElementById("team1Select");
    const team2Select = document.getElementById("team2Select");
    teamsList.innerHTML = "";
    team1Select.innerHTML = "";
    team2Select.innerHTML = "";

    onValue(ref(db, "teams"), (snapshot) => {
        teamsList.innerHTML = "";
        team1Select.innerHTML = "";
        team2Select.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            const li = document.createElement("li");
            li.textContent = team.name;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Löschen";
            deleteBtn.onclick = () => remove(ref(db, "teams/" + childSnapshot.key));
            li.appendChild(deleteBtn);
            teamsList.appendChild(li);

            const option1 = document.createElement("option");
            option1.value = team.name;
            option1.textContent = team.name;
            team1Select.appendChild(option1);

            const option2 = document.createElement("option");
            option2.value = team.name;
            option2.textContent = team.name;
            team2Select.appendChild(option2);
        });
    });
}

// Match hinzufügen
function addMatch() {
    const team1 = document.getElementById("team1Select").value;
    const team2 = document.getElementById("team2Select").value;
    if (team1 === team2 || !team1 || !team2) return;
    set(ref(db, "matches/" + team1 + "_vs_" + team2), {
        team1: team1,
        team2: team2,
        score: "0:0",
    });
}

// Matches anzeigen und löschen
function loadMatches() {
    const matchesList = document.getElementById("matchesList");
    matchesList.innerHTML = "";

    onValue(ref(db, "matches"), (snapshot) => {
        matchesList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const li = document.createElement("li");
            li.textContent = `${match.team1} vs. ${match.team2} (${match.score})`;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Löschen";
            deleteBtn.onclick = () => remove(ref(db, "matches/" + childSnapshot.key));
            li.appendChild(deleteBtn);
            matchesList.appendChild(li);
        });
    });
}

// Ergebnisse aus Matches anzeigen (Spiele mit Score)
function loadResults() {
    const resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";

    onValue(ref(db, "matches"), (snapshot) => {
        resultsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score !== "0:0") {
                const li = document.createElement("li");
                li.textContent = `${match.team1} ${match.score} ${match.team2}`;
                resultsList.appendChild(li);
            }
        });
    });
}

// Rangliste anzeigen
function loadRanking() {
    const rankingTable = document.getElementById("rankingTable");
    rankingTable.innerHTML = "";

    onValue(ref(db, "ranking"), (snapshot) => {
        rankingTable.innerHTML = "";
        let rank = 1;
        snapshot.forEach((childSnapshot) => {
            const teamStats = childSnapshot.val();
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${rank++}</td>
                <td>${childSnapshot.key}</td>
                <td>${teamStats.games}</td>
                <td>${teamStats.points}</td>
                <td>${teamStats.goals}</td>
                <td>${teamStats.conceded}</td>
                <td>${teamStats.diff}</td>
            `;
            rankingTable.appendChild(tr);
        });
    });
}

// Firebase-Daten laden
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadResults();
    loadRanking();
};

// Globale Funktionen für Buttons
window.addNews = addNews;
window.addTeam = addTeam;
window.addMatch = addMatch;
