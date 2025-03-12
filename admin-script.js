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

// TEAMS LADEN (mit Löschen-Button)
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
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "teams/" + child.key));
            li.appendChild(delBtn);
            teamList.appendChild(li);
        });
    });
}

// SPIELE LADEN (mit Ergebnis-Eingabe & Löschen)
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
            
            // Löschen-Button
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

// ERGEBNIS SPEICHERN UND SPIEL VERSCHIEBEN
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

// RESULTATE LADEN (mit Zurücksetzen-Button)
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

// SPIEL ZURÜCKSETZEN (von Resultate zu Offene Spiele)
export function resetMatch(matchId, teamA, teamB) {
    remove(ref(db, `results/${matchId}`)).then(() => {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" });
    });
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadResults();
};
