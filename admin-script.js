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

            const optionA = document.createElement("option");
            optionA.value = data.name;
            optionA.textContent = data.name;
            teamASelect.appendChild(optionA);

            const optionB = document.createElement("option");
            optionB.value = data.name;
            optionB.textContent = data.name;
            teamBSelect.appendChild(optionB);
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
            
            if (data.score && data.score !== "-:-") {
                resultList.appendChild(li);
            } else {
                matchList.appendChild(li);
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

// ERGEBNIS SPEICHERN & RANGLISTE AKTUALISIEREN
function saveResult(matchId, score) {
    if (!score.includes(":")) return;
    const [scoreA, scoreB] = score.split(":").map(Number);
    if (isNaN(scoreA) || isNaN(scoreB)) return;

    const matchRef = ref(db, `matches/${matchId}`);
    onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return;
        const { teamA, teamB } = data;

        update(ref(db, `matches/${matchId}`), { score });
        
        generateRanking();
    }, { onlyOnce: true });
}

// NEUE RANGLISTE BERECHNEN
function generateRanking() {
    const rankingRef = ref(db, "ranking");
    const matchRef = ref(db, "matches");

    onValue(matchRef, (snapshot) => {
        let rankings = {};

        snapshot.forEach((child) => {
            const data = child.val();
            if (!data.score || data.score === "-:-") return;

            const [scoreA, scoreB] = data.score.split(":").map(Number);
            if (isNaN(scoreA) || isNaN(scoreB)) return;

            if (!rankings[data.teamA]) rankings[data.teamA] = { name: data.teamA, games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            if (!rankings[data.teamB]) rankings[data.teamB] = { name: data.teamB, games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };

            rankings[data.teamA].games += 1;
            rankings[data.teamB].games += 1;

            rankings[data.teamA].goals += scoreA;
            rankings[data.teamB].goals += scoreB;

            rankings[data.teamA].conceded += scoreB;
            rankings[data.teamB].conceded += scoreA;

            rankings[data.teamA].diff = rankings[data.teamA].goals - rankings[data.teamA].conceded;
            rankings[data.teamB].diff = rankings[data.teamB].goals - rankings[data.teamB].conceded;

            if (scoreA > scoreB) rankings[data.teamA].points += 10;
            else rankings[data.teamB].points += 10;
        });

        const sortedRankings = Object.values(rankings).sort((a, b) => b.points - a.points);
        sortedRankings.forEach((team, index) => {
            team.rank = index + 1;
        });

        set(rankingRef, sortedRankings);
    }, { onlyOnce: true });
}

// LADEN BEI SEITENAUFRUF
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
};
