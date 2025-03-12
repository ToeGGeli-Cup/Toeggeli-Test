import { db, ref, set, update, remove, onValue } from "./firebase.js";

// 📰 NEWS MANAGEMENT
function addNews() {
    const newsText = document.getElementById("newsInput").value;
    if (newsText === "") return alert("Bitte eine Nachricht eingeben!");

    set(ref(db, 'news/' + Date.now()), { text: newsText });

    document.getElementById("newsInput").value = "";
}

function renderNews(newsData) {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    for (let id in newsData) {
        let li = document.createElement("li");
        li.innerHTML = `${newsData[id].text} 
            <button onclick="deleteNews('${id}')">Löschen</button>`;
        newsList.appendChild(li);
    }
}

function deleteNews(id) {
    remove(ref(db, 'news/' + id));
}

// 🏆 TEAM MANAGEMENT
function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;

    if (teamName === "" || player1 === "" || player2 === "") {
        alert("Bitte Teamname und beide Spieler:innen angeben!");
        return;
    }

    set(ref(db, 'teams/' + teamName), {
        name: teamName,
        player1: player1,
        player2: player2
    });

    document.getElementById("teamName").value = "";
    document.getElementById("player1").value = "";
    document.getElementById("player2").value = "";
}

function renderTeams(teamsData) {
    const teamsList = document.getElementById("teamsList");
    teamsList.innerHTML = "";
    for (let id in teamsData) {
        let li = document.createElement("li");
        li.innerHTML = `<strong>${teamsData[id].name}</strong> (${teamsData[id].player1} & ${teamsData[id].player2}) 
            <button onclick="deleteTeam('${id}')">Löschen</button>`;
        teamsList.appendChild(li);
    }
}

function deleteTeam(id) {
    remove(ref(db, 'teams/' + id));
}

// ⚽ MATCH MANAGEMENT
function addMatch() {
    const team1 = document.getElementById("team1Select").value;
    const team2 = document.getElementById("team2Select").value;

    if (team1 === team2) {
        alert("Ein Team kann nicht gegen sich selbst spielen!");
        return;
    }

    set(ref(db, 'matches/' + team1 + '_vs_' + team2), {
        team1: team1,
        team2: team2,
        score: null
    });
}

function renderMatches(matchesData) {
    const openMatchesList = document.getElementById("openMatchesList");
    const resultsList = document.getElementById("resultsList");

    openMatchesList.innerHTML = "";
    resultsList.innerHTML = "";

    for (let id in matchesData) {
        let match = matchesData[id];
        let li = document.createElement("li");

        if (match.score === null) {
            li.innerHTML = `${match.team1} vs. ${match.team2} 
                <button onclick="addScore('${id}')">Ergebnis eintragen</button>
                <button onclick="deleteMatch('${id}')">Löschen</button>`;
            openMatchesList.appendChild(li);
        } else {
            li.innerHTML = `${match.team1} vs. ${match.team2} - <strong>${match.score}</strong> 
                <button onclick="deleteMatch('${id}')">Löschen</button>`;
            resultsList.appendChild(li);
        }
    }
}

function addScore(matchId) {
    const score = prompt("Ergebnis eingeben (z.B. 10:8):");
    if (!score.match(/^\d+:\d+$/)) {
        alert("Falsches Format! Bitte z.B. 10:8 eingeben.");
        return;
    }

    update(ref(db, 'matches/' + matchId), { score: score });
}

function deleteMatch(id) {
    remove(ref(db, 'matches/' + id));
}

// 📊 RANKING MANAGEMENT
function renderRanking(rankingData) {
    const rankingTable = document.getElementById("rankingTable");
    rankingTable.innerHTML = "";

    Object.entries(rankingData)
        .sort((a, b) => b[1].points - a[1].points)
        .forEach(([team, stats], index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${team}</td>
                <td>${stats.games}</td>
                <td>${stats.points}</td>
                <td>${stats.goals}</td>
                <td>${stats.conceded}</td>
                <td>${stats.diff}</td>
            </tr>`;
            rankingTable.innerHTML += row;
        });
}

// 📡 DATA LISTENERS
onValue(ref(db, 'news'), snapshot => renderNews(snapshot.val() || {}));
onValue(ref(db, 'teams'), snapshot => renderTeams(snapshot.val() || {}));
onValue(ref(db, 'matches'), snapshot => renderMatches(snapshot.val() || {}));
onValue(ref(db, 'ranking'), snapshot => renderRanking(snapshot.val() || {}));
