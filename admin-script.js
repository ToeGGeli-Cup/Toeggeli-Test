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

// NEWS HINZUFÜGEN
export function addNews() {
    const newsInput = document.getElementById("newsInput").value;
    if (newsInput) {
        push(ref(db, "news"), { text: newsInput, date: new Date().toLocaleDateString("de-DE") });
        document.getElementById("newsInput").value = "";
    }
}

// TEAMS LADEN (mit Dropdown-Fix)
export function loadTeams() {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
        const teamList = document.getElementById("teamList");
        const teamASelect = document.getElementById("teamA");
        const teamBSelect = document.getElementById("teamB");
        if (!teamList || !teamASelect || !teamBSelect) return;
        teamList.innerHTML = "";
        teamASelect.innerHTML = "<option value=''>-- Team wählen --</option>";
        teamBSelect.innerHTML = "<option value=''>-- Team wählen --</option>";
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
            matchList.appendChild(li);
        });
    });
}

// SPIELERGEBNIS SPEICHERN UND SPIEL VERSCHIEBEN
export function updateMatch(matchId, score) {
    if (!/^10:\d+$|^\d+:10$/.test(score)) return;
    const matchRef = ref(db, `matches/${matchId}`);
    onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            push(ref(db, "results"), { teamA: data.teamA, teamB: data.teamB, score });
            remove(ref(db, `matches/${matchId}`));
        }
    }, { onlyOnce: true });
}

// SPIEL ZURÜCKSETZEN
export function resetMatch(matchId, teamA, teamB) {
    remove(ref(db, `results/${matchId}`)).then(() => {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" }).then(() => {
            loadMatches();
            loadResults();
        });
    });
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
                <td><button onclick="resetMatch('${childSnapshot.key}', '${match.teamA}', '${match.teamB}')">🔄 Zurücksetzen</button></td>
            `;
            resultsTable.appendChild(row);
        });
    });
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadResults();
};

// Debugging: Sicherstellen, dass Funktionen global verfügbar sind
window.resetMatch = resetMatch;
window.addTeam = addTeam;
window.addMatch = addMatch;
window.loadResults = loadResults;
window.updateMatch = updateMatch;
