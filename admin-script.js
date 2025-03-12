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

// TEAMS HINZUFÜGEN
export function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    if (teamName && player1 && player2) {
        push(ref(db, "teams"), { name: teamName, player1, player2 });
        document.getElementById("teamName").value = "";
        document.getElementById("player1").value = "";
        document.getElementById("player2").value = "";
    }
}

// SPIELE HINZUFÜGEN
export function addMatch() {
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    if (teamA && teamB && teamA !== teamB) {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" });
    }
}

// RESULTATE UND RANGLISTE LADEN
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

        loadRanking(snapshot);
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
    loadResults();
};
