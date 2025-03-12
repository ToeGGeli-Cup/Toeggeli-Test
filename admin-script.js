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

// SPIELE AUTOMATISCH GENERIEREN (Round Robin System)
export function generateMatches(teams = []) {
    if (teams.length < 2) return;
    const matchesRef = ref(db, "matches");
    set(matchesRef, {});
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            push(matchesRef, { teamA: teams[i], teamB: teams[j], score: "-:-" });
        }
    }
    loadMatches();
}

// TEAMS LADEN UND SPIELE AUTOMATISCH ERSTELLEN
export function loadTeams() {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
        const teamList = document.getElementById("teamList");
        if (!teamList) return;
        teamList.innerHTML = "";
        let teams = [];
        snapshot.forEach((child) => {
            const data = child.val();
            teams.push(data.name);
            const li = document.createElement("li");
            li.textContent = `${data.name} (${data.player1} & ${data.player2})`;
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "teams/" + child.key)).then(() => generateMatches(teams));
            li.appendChild(delBtn);
            teamList.appendChild(li);
        });
        generateMatches(teams);
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
            const scoreInput = document.createElement("input");
            scoreInput.type = "text";
            scoreInput.placeholder = "z.B. 10:5";
            scoreInput.value = data.score === "-:-" ? "" : data.score;
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

// ERGEBNIS SPEICHERN UND MATCH AKTUALISIEREN
export function updateMatch(matchId, score) {
    if (!/^10:\d+$|^\d+:10$/.test(score)) return;
    const matchRef = ref(db, `matches/${matchId}`);
    update(matchRef, { score }).then(() => {
        loadMatches();
        loadRanking();
    });
}

// RANGLISTE LADEN
export function loadRanking() {
    onValue(ref(db, "teams"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        if (!rankingTable) return;
        rankingTable.innerHTML = "";
        let teams = [];
        snapshot.forEach((child) => {
            teams.push(child.val());
        });
        teams.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
        teams.forEach((team, index) => {
            rankingTable.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.games || 0}</td>
                <td>${team.points || 0}</td>
                <td>${team.goals || 0}</td>
                <td>${team.conceded || 0}</td>
                <td>${team.diff || 0}</td>
            </tr>`;
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
