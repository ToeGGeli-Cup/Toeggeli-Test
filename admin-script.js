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
        if (!matchList) return;
        matchList.innerHTML = "";
        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.teamA} vs ${data.teamB} - ${data.score || "-:-"}`;

            const scoreInput = document.createElement("input");
            scoreInput.placeholder = "Ergebnis (10:5)";
            scoreInput.value = data.score !== "-:-" ? data.score : "";
            
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "✓";
            saveBtn.onclick = () => {
                if (scoreInput.value) {
                    update(ref(db, "results/" + child.key), {
                        teamA: data.teamA,
                        teamB: data.teamB,
                        score: scoreInput.value
                    });
                    remove(ref(db, "matches/" + child.key));  // Spiel von "Offene Spiele" zu "Resultate" verschieben
                }
            };

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

// ERGEBNISSE LADEN
export function loadResults() {
    const resultList = document.getElementById("resultList");
    if (!resultList) return;
    resultList.innerHTML = "";
    onValue(ref(db, "results"), (snapshot) => {
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
export function loadRanking() {
    onValue(ref(db, "ranking"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        if (!rankingTable) return;
        rankingTable.innerHTML = "";
        snapshot.forEach((child) => {
            const data = child.val();
            const row = rankingTable.insertRow();
            row.innerHTML = `<td>${data.rank}</td><td>${data.team}</td><td>${data.games}</td><td>${data.points}</td><td>${data.goals}</td><td>${data.conceded}</td><td>${data.diff}</td>`;
        });
    });
}

// ALLES LADEN BEIM SEITENSTART
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadResults();  // ✅ FIX: Ergebnisse jetzt korrekt laden!
    loadRanking();  // ✅ FIX: Ranking jetzt automatisch laden!
};
