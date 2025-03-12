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

// TEAMS LADEN UND SPIELE AUTOMATISCH ERSTELLEN
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

        let teams = [];
        snapshot.forEach((child) => {
            const data = child.val();
            teams.push(data.name);
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
            delBtn.onclick = () => remove(ref(db, "teams/" + child.key)).then(() => generateMatches());
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
            
            // Eingabefeld für das Ergebnis
            const scoreInput = document.createElement("input");
            scoreInput.type = "text";
            scoreInput.placeholder = "z.B. 10:5";
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

// ERGEBNIS SPEICHERN UND MATCH AKTUALISIEREN (Fix: Ein Team muss genau 10 Tore haben)
export function updateMatch(matchId, score) {
    if (!/^10:\d+$|^\d+:10$/.test(score)) return; // Überprüfung: Genau eine 10 erlaubt
    
    const matchRef = ref(db, `matches/${matchId}`);
    update(matchRef, { score }).then(() => {
        loadMatches();
        loadRanking();
    });
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadRanking();
};
