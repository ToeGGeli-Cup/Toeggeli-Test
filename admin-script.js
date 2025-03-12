import { db, ref, onValue, push, set, remove, update } from "./firebase.js";

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

// MATCH-ERGEBNIS SPEICHERN UND RANKING AKTUALISIEREN
export function updateMatch(matchId, score) {
    if (!score.includes(":")) return;
    
    const matchRef = ref(db, `matches/${matchId}`);
    onValue(matchRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const [scoreA, scoreB] = score.split(":" ).map(Number);

            // Neues Ergebnis speichern
            push(ref(db, "results"), { teamA: data.teamA, teamB: data.teamB, score });

            // Offenes Spiel entfernen
            remove(ref(db, `matches/${matchId}`));

            // Rangliste neu laden
            setTimeout(loadRanking, 500);
        }
    }, { onlyOnce: true });
}

// RANGLISTE LADEN
export function loadRanking() {
    onValue(ref(db, "results"), (resultsSnapshot) => {
        let rankings = {};

        resultsSnapshot.forEach((child) => {
            const match = child.val();
            const [scoreA, scoreB] = match.score.split(":" ).map(Number);

            if (!rankings[match.teamA]) rankings[match.teamA] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            if (!rankings[match.teamB]) rankings[match.teamB] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };

            rankings[match.teamA].games += 1;
            rankings[match.teamB].games += 1;
            rankings[match.teamA].goals += scoreA;
            rankings[match.teamB].goals += scoreB;
            rankings[match.teamA].conceded += scoreB;
            rankings[match.teamB].conceded += scoreA;
            rankings[match.teamA].diff = rankings[match.teamA].goals - rankings[match.teamA].conceded;
            rankings[match.teamB].diff = rankings[match.teamB].goals - rankings[match.teamB].conceded;

            if (scoreA > scoreB) rankings[match.teamA].points += 1;
            else if (scoreB > scoreA) rankings[match.teamB].points += 1;
        });

        // Sortieren nach Punkten, Tordifferenz, Toren
        const sortedTeams = Object.keys(rankings).sort((a, b) =>
            rankings[b].points - rankings[a].points ||
            rankings[b].diff - rankings[a].diff ||
            rankings[b].goals - rankings[a].goals
        );

        // Rangliste in HTML aktualisieren
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        sortedTeams.forEach((team, index) => {
            rankingTable.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${team}</td>
                <td>${rankings[team].games}</td>
                <td>${rankings[team].points}</td>
                <td>${rankings[team].goals}</td>
                <td>${rankings[team].conceded}</td>
                <td>${rankings[team].diff}</td>
            </tr>`;
        });
    });
}

// ALLES LADEN
window.onload = function () {
    loadMatches();
    loadRanking();
};
