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

// TEAMS LADEN
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
            teamList.appendChild(li);
        });
    });
}

// RANGLISTE LADEN (ALLE TEAMS ANZEIGEN)
export function loadRanking() {
    const teamsRef = ref(db, "teams");
    const resultsRef = ref(db, "results");
    
    onValue(teamsRef, (teamsSnapshot) => {
        let rankings = {};
        
        // Zuerst alle Teams mit 0 Werten initialisieren
        teamsSnapshot.forEach((child) => {
            rankings[child.val().name] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
        });
        
        // Ergebnisse auswerten
        onValue(resultsRef, (resultsSnapshot) => {
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
            
            // Sortierung nach Punkten -> Tordifferenz -> Tore
            const rankingTable = document.getElementById("rankingTable");
            if (!rankingTable) return;
            rankingTable.innerHTML = "";
            Object.keys(rankings).sort((a, b) =>
                rankings[b].points - rankings[a].points ||
                rankings[b].diff - rankings[a].diff ||
                rankings[b].goals - rankings[a].goals
            ).forEach((team, index) => {
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
    });
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadResults();
    loadRanking();
};
