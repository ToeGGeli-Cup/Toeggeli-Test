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
        const teamADropdown = document.getElementById("teamA");
        const teamBDropdown = document.getElementById("teamB");

        if (!teamList || !teamADropdown || !teamBDropdown) return;

        teamList.innerHTML = "";
        teamADropdown.innerHTML = "";
        teamBDropdown.innerHTML = "";

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
            teamADropdown.appendChild(optionA);

            const optionB = document.createElement("option");
            optionB.value = data.name;
            optionB.textContent = data.name;
            teamBDropdown.appendChild(optionB);
        });
    });
}

// TEAMS HINZUFÜGEN
export function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    if (teamName && player1 && player2) {
        push(ref(db, "teams"), { name: teamName, player1, player2, games: 0, points: 0, goals: 0, conceded: 0 });
        updateRanking();
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
        const resultList = document.getElementById("resultList");

        if (!matchList || !resultList) return;

        matchList.innerHTML = "";
        resultList.innerHTML = "";

        snapshot.forEach((child) => {
            const data = child.val();
            const li = document.createElement("li");
            li.textContent = `${data.teamA} vs ${data.teamB} - ${data.score || "-:-"}`;

            const scoreInput = document.createElement("input");
            scoreInput.placeholder = "Ergebnis (10:5)";
            const saveBtn = document.createElement("button");
            saveBtn.textContent = "✓";

            saveBtn.onclick = () => {
                if (scoreInput.value !== "-:-") {
                    update(ref(db, "matches/" + child.key), { score: scoreInput.value }).then(() => {
                        set(ref(db, "results/" + child.key), data);
                        remove(ref(db, "matches/" + child.key));
                        updateRanking();
                        loadResults();
                    });
                }
            };

            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "matches/" + child.key));

            li.appendChild(scoreInput);
            li.appendChild(saveBtn);
            li.appendChild(delBtn);

            if (data.score === "-:-") {
                matchList.appendChild(li);
            } else {
                resultList.appendChild(li);
            }
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

// RANGLISTE SPEICHERN & LADEN
export function updateRanking() {
    const teamsRef = ref(db, "teams");
    onValue(teamsRef, (snapshot) => {
        let rankings = [];
        snapshot.forEach((child) => {
            const team = child.val();
            rankings.push({
                name: team.name,
                games: team.games || 0,
                points: team.points || 0,
                goals: team.goals || 0,
                conceded: team.conceded || 0,
                diff: (team.goals || 0) - (team.conceded || 0)
            });
        });

        rankings.sort((a, b) => b.points - a.points || b.diff - a.diff);
        set(ref(db, "ranking"), rankings);
    });
}

// RANGLISTE ANZEIGEN
export function loadRanking() {
    const rankingTable = document.getElementById("rankingTable");
    if (!rankingTable) return;

    onValue(ref(db, "ranking"), (snapshot) => {
        rankingTable.innerHTML = "";
        snapshot.forEach((child, index) => {
            const data = child.val();
            const row = rankingTable.insertRow();
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${data.name}</td>
                <td>${data.games}</td>
                <td>${data.points}</td>
                <td>${data.goals}</td>
                <td>${data.conceded}</td>
                <td>${data.diff}</td>
            `;
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
