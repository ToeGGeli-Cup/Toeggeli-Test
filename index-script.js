import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const resultsRef = ref(db, "results");
    
    // RESULTATE UND RANGLISTE LADEN
    onValue(resultsRef, (snapshot) => {
        const resultsTable = document.getElementById("resultsTable");
        resultsTable.innerHTML = "";
        
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            resultsTable.innerHTML += `<tr>
                <td>${match.teamA}</td>
                <td>${match.teamB}</td>
                <td>${match.score}</td>
            </tr>`;
        });

        loadRanking(snapshot);
    });

    // RANGLISTE LADEN
    function loadRanking(snapshot) {
        let rankings = {};

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const [scoreA, scoreB] = match.score.split(":" ).map(Number);

            if (!rankings[match.teamA]) rankings[match.teamA] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            if (!rankings[match.teamB]) rankings[match.teamB] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };

            rankings[match.teamA].games += 1;
            rankings[match.teamB].games += 1;
            rankings[match.teamA].goals += scoreA;
            rankings[match.teamB].goals += scoreB;
            rankings[match.teamA].conceded += scoreB;
            rankings[match.teamB].conceded += scoreA;

            if (scoreA > scoreB) rankings[match.teamA].points += 1;
            else if (scoreB > scoreA) rankings[match.teamB].points += 1;
        });

        // Sortieren und in HTML aktualisieren
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        Object.keys(rankings).sort((a, b) => rankings[b].points - rankings[a].points).forEach((team, index) => {
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
    }
});
