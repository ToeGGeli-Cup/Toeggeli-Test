import { db, ref, onValue, push, remove, update } from "./firebase.js";

// NEWS LADEN
export function loadNews() {
    const newsRef = ref(db, "news");
    onValue(newsRef, (snapshot) => {
        const newsList = document.getElementById("newsList");
        if (!newsList) return;
        newsList.innerHTML = "";
        snapshot.forEach((child) => {
            const li = document.createElement("li");
            li.textContent = child.val().text;
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "news/" + child.key));
            li.appendChild(delBtn);
            newsList.appendChild(li);
        });
    });
}

// TEAMS LADEN
export function loadTeams() {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
        const teamList = document.getElementById("teamList");
        if (!teamList) return;
        teamList.innerHTML = "";
        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.name} (${data.player1} & ${data.player2})`;
            teamList.appendChild(li);
        });
    });
}

// SPIELE LADEN UND ERGEBNISEINGABE ERMÖGLICHEN
export function loadMatches() {
    const matchRef = ref(db, "matches");
    onValue(matchRef, (snapshot) => {
        const matchList = document.getElementById("matchList");
        if (!matchList) return;
        matchList.innerHTML = "";
        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.teamA} vs ${data.teamB} - ${data.score || "-:-"}`;
            
            // Eingabe für Ergebnis
            const scoreInput = document.createElement("input");
            scoreInput.type = "text";
            scoreInput.placeholder = "10:5";
            scoreInput.value = data.score === "-:-" ? "" : data.score;
            
            // Speichern-Button
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "✓";
            saveBtn.onclick = () => updateMatch(child.key, scoreInput.value);
            
            li.appendChild(scoreInput);
            li.appendChild(saveBtn);
            matchList.appendChild(li);
        });
    });
}

// ERGEBNIS SPEICHERN UND SPIEL VERSCHIEBEN
export function updateMatch(matchId, score) {
    if (!/^10:\d+$|^\d+:10$/.test(score)) return;
    const matchRef = ref(db, `matches/${matchId}`);
    onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            push(ref(db, "results"), { teamA: data.teamA, teamB: data.teamB, score });
            remove(ref(db, `matches/${matchId}`));
            loadResults();
            loadRanking();
        }
    }, { onlyOnce: true });
}

// RESULTATE LADEN
export function loadResults() {
    const resultsRef = ref(db, "results");
    onValue(resultsRef, (snapshot) => {
        const resultsTable = document.getElementById("resultsTable");
        if (!resultsTable) return;
        resultsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${match.teamA}</td>
                <td>${match.teamB}</td>
                <td>${match.score}</td>
            `;
            resultsTable.appendChild(row);
        });
    });
}

// RANGLISTE LADEN
export function loadRanking() {
    onValue(ref(db, "results"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        if (!rankingTable) return;
        rankingTable.innerHTML = "";
        let rankings = {};
        snapshot.forEach((child) => {
            const match = child.val();
            const [scoreA, scoreB] = match.score.split(":" ).map(Number);
            if (!rankings[match.teamA]) rankings[match.teamA] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            if (!rankings[match.teamB]) rankings[match.teamB] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            rankings[match.teamA].games += 1;
            rankings[match.teamB].games += 1;
            rankings[match.teamA].goals += scoreA;
            rankings[match.teamB].goals += scoreB;
            rankings[match.teamA].conceded += scoreB;
            rankings[match.teamB].conceded += scoreA;
            rankings[match.teamA].diff = rankings[match.teamA].goals - rankings[match.teamA].conceded;
            rankings[match.teamB].diff = rankings[match.teamB].goals - rankings[match.teamB].conceded;
            if (scoreA > scoreB) rankings[match.teamA].points += 1;
            else if (scoreB > scoreA) rankings[match.teamB].points += 1;
        });
        Object.keys(rankings).sort((a, b) => rankings[b].points - rankings[a].points).forEach((team, index) => {
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

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadResults();
    loadRanking();
};
