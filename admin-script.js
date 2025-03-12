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

            const optionA = document.createElement("option");
            const optionB = document.createElement("option");
            optionA.value = optionB.value = data.name;
            optionA.textContent = optionB.textContent = data.name;

            teamASelect.appendChild(optionA);
            teamBSelect.appendChild(optionB);

            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "teams/" + child.key));
            li.appendChild(delBtn);
            teamList.appendChild(li);
        });
    });
}

// TEAMS HINZUFÜGEN
export function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    if (teamName && player1 && player2) {
        push(ref(db, "teams"), { name: teamName, player1, player2, games: 0, points: 0, goals: 0, conceded: 0, diff: 0 });
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
        if (!matchList) return;
        matchList.innerHTML = "";
        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.teamA} vs ${data.teamB} - ${data.score || "-:-"}`;
            const scoreInput = document.createElement("input");
            scoreInput.placeholder = "Ergebnis (10:5)";
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "✓";
            saveBtn.onclick = () => updateMatch(child.key, scoreInput.value);
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
export function addMatch() {
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    if (teamA && teamB && teamA !== teamB) {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" });
    }
}

// MATCH-ERGEBNIS SPEICHERN UND RANKING AKTUALISIEREN
export function updateMatch(matchId, score) {
    const matchRef = ref(db, `matches/${matchId}`);
    onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const [scoreA, scoreB] = score.split(":").map(Number);
            const pointsA = scoreA > scoreB ? 1 : 0;
            const pointsB = scoreB > scoreA ? 1 : 0;

            update(ref(db, `teams/${data.teamA}`), {
                games: (data.games || 0) + 1,
                points: (data.points || 0) + pointsA,
                goals: (data.goals || 0) + scoreA,
                conceded: (data.conceded || 0) + scoreB,
                diff: (data.diff || 0) + (scoreA - scoreB)
            });

            update(ref(db, `teams/${data.teamB}`), {
                games: (data.games || 0) + 1,
                points: (data.points || 0) + pointsB,
                goals: (data.goals || 0) + scoreB,
                conceded: (data.conceded || 0) + scoreA,
                diff: (data.diff || 0) + (scoreB - scoreA)
            });

            push(ref(db, "results"), { teamA: data.teamA, teamB: data.teamB, score });
            remove(ref(db, `matches/${matchId}`));
        }
    }, { onlyOnce: true });
}

// RANGLISTE LADEN
export function loadRanking() {
    onValue(ref(db, "teams"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        let teams = [];
        snapshot.forEach((child) => {
            const data = child.val();
            teams.push({ ...data, key: child.key });
        });
        teams.sort((a, b) => b.points - a.points || b.diff - a.diff || b.goals - a.goals);
        teams.forEach((team, index) => {
            const row = rankingTable.insertRow();
            row.innerHTML = `<td>${index + 1}</td><td>${team.name}</td><td>${team.games}</td><td>${team.points}</td><td>${team.goals}</td><td>${team.conceded}</td><td>${team.diff}</td>`;
        });
    });
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadRanking();
};
