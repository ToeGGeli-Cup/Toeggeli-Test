import { db, ref, onValue, push, remove, update } from "./firebase.js";

// TEAM HINZUFÜGEN (Fix für 'm.addTeam is not a function')
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

// RESULTATE LADEN UND ANZEIGEN UNTER "RESULTATE"
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

// ERGEBNIS SPEICHERN UND SPIEL VERSCHIEBEN UNTER "RESULTATE"
export function updateMatch(matchId, score) {
    if (!/^10:\d+$|^\d+:10$/.test(score)) return;
    const matchRef = ref(db, `matches/${matchId}`);
    onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            push(ref(db, "results"), { teamA: data.teamA, teamB: data.teamB, score }).then(() => {
                remove(ref(db, `matches/${matchId}`));
                loadResults(); // Aktualisiert die Ansicht unter "Resultate"
            });
        }
    }, { onlyOnce: true });
}

// ALLES LADEN (Lässt bestehende Funktionen unberührt!)
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadResults();
    loadRanking();
};
