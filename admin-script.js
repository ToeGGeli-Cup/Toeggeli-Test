import { db, ref, onValue, push, set, remove, update } from "./firebase.js";

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

// NEWS HINZUFÜGEN
export function addNews() {
    const newsInput = document.getElementById("newsInput").value;
    if (newsInput) {
        push(ref(db, "news"), { text: newsInput, date: new Date().toLocaleDateString("de-DE") });
        document.getElementById("newsInput").value = "";
    }
}

// TEAMS LADEN
export function loadTeams() {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
        const teamList = document.getElementById("teamList");
        const teamASelect = document.getElementById("teamA");
        const teamBSelect = document.getElementById("teamB");
        
        if (!teamList || !teamASelect || !teamBSelect) return;

        teamList.innerHTML = "";
        teamASelect.innerHTML = "";
        teamBSelect.innerHTML = "";

        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.name} (${data.player1} & ${data.player2})`;
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "teams/" + child.key));
            li.appendChild(delBtn);
            teamList.appendChild(li);

            // Teams in Dropdown-Menüs einfügen
            let optionA = new Option(data.name, data.name);
            let optionB = new Option(data.name, data.name);
            teamASelect.add(optionA);
            teamBSelect.add(optionB);
        });
    });
}

// TEAMS HINZUFÜGEN
export function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    if (teamName && player1 && player2) {
        push(ref(db, "teams"), { name: teamName, player1, player2, games: 0, points: 0 });
        document.getElementById("teamName").value = "";
        document.getElementById("player1").value = "";
        document.getElementById("player2").value = "";
    }
}

// SPIELE LADEN
export function loadMatches() {
    const matchRef = ref(db, "matches");
    onValue(matchRef, (snapshot) => {
        const matchList = document.getElementById("matchList");
        const resultList = document.getElementById("resultList");
        if (!matchList || !resultList) return;
        
        matchList.innerHTML = "";
        resultList.innerHTML = "";

        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.teamA} vs ${data.teamB} - ${data.score || "-:-"}`;

            // Ergebnisfeld für Resultate
            const scoreInput = document.createElement("input");
            scoreInput.placeholder = "Ergebnis (10:5)";

            const saveBtn = document.createElement("button");
            saveBtn.textContent = "✓";
            saveBtn.onclick = () => saveResult(child.key, scoreInput.value);

            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "matches/" + child.key));

            li.appendChild(scoreInput);
            li.appendChild(saveBtn);
            li.appendChild(delBtn);

            if (data.score === "-:-") {
                matchList.appendChild(li);  // Offene Spiele
            } else {
                resultList.appendChild(li); // Resultate
            }
        });
    });
}

// SPIELE HINZUFÜGEN
export function addMatch() {
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    if (teamA && teamB && teamA !== teamB) {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" });
    }
}

// ERGEBNISSE SPEICHERN UND RANGLISTE AKTUALISIEREN
export function saveResult(matchId, score) {
    const matchRef = ref(db, `matches/${matchId}`);
    update(matchRef, { score }).then(() => {
        updateRanking();  // ✅ Rangliste nach Ergebniseingabe aktualisieren
    });
}

// FUNKTION ZUM AKTUALISIEREN DER RANGLISTE
export function updateRanking() {
    const rankingRef = ref(db, "ranking");
    const resultsRef = ref(db, "matches");

    onValue(resultsRef, (snapshot) => {
        let rankings = {};

        snapshot.forEach((child) => {
            const data = child.val();
            if (data.score === "-:-") return; // Offene Spiele ignorieren

            const teamA = data.teamA;
            const teamB = data.teamB;
            const score = data.score.split(":").map(Number);
            const goalsA = score[0];
            const goalsB = score[1];

            if (!rankings[teamA]) rankings[teamA] = { name: teamA, games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            if (!rankings[teamB]) rankings[teamB] = { name: teamB, games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };

            rankings[teamA].games += 1;
            rankings[teamB].games += 1;

            rankings[teamA].goals += goalsA;
            rankings[teamB].goals += goalsB;

            rankings[teamA].conceded += goalsB;
            rankings[teamB].conceded += goalsA;

            rankings[teamA].diff = rankings[teamA].goals - rankings[teamA].conceded;
            rankings[teamB].diff = rankings[teamB].goals - rankings[teamB].conceded;

            if (goalsA > goalsB) {
                rankings[teamA].points += 10;
            } else {
                rankings[teamB].points += 10;
            }
        });

        let sortedRankings = Object.values(rankings).sort((a, b) => b.points - a.points);
        let rankData = {};
        sortedRankings.forEach((team, index) => {
            rankData[index + 1] = { rank: index + 1, ...team };
        });

        set(rankingRef, rankData);
    });
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
};
