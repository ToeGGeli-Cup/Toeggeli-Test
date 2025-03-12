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
        const teamSelectA = document.getElementById("teamA");
        const teamSelectB = document.getElementById("teamB");

        if (!teamList || !teamSelectA || !teamSelectB) return;

        teamList.innerHTML = "";
        teamSelectA.innerHTML = "";
        teamSelectB.innerHTML = "";

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
            const optionB = document.createElement("option");
            optionA.value = optionB.value = data.name;
            optionA.textContent = optionB.textContent = data.name;
            teamSelectA.appendChild(optionA);
            teamSelectB.appendChild(optionB);
        });
    });
}

// TEAMS HINZUFÜGEN
export function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    if (teamName && player1 && player2) {
        push(ref(db, "teams"), { name: teamName, player1, player2, games: 0, points: 0, goals: 0, conceded: 0, diff: 0 });
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
            scoreInput.value = data.score === "-:-" ? "" : data.score;

            const saveBtn = document.createElement("button");
            saveBtn.textContent = "✓";
            saveBtn.onclick = () => {
                update(ref(db, "matches/" + child.key), { score: scoreInput.value }).then(() => {
                    updateRanking();
                });
            };

            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "matches/" + child.key));

            li.appendChild(scoreInput);
            li.appendChild(saveBtn);
            li.appendChild(delBtn);

            if (data.score && data.score !== "-:-") {
                resultList.appendChild(li);
            } else {
                matchList.appendChild(li);
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

// RANGLISTE AKTUALISIEREN
export function updateRanking() {
    const rankingRef = ref(db, "ranking");
    const matchesRef = ref(db, "matches");
    const teamsRef = ref(db, "teams");

    onValue(matchesRef, (snapshot) => {
        const teamStats = {};

        snapshot.forEach((child) => {
            const match = child.val();
            if (!match.score || match.score === "-:-") return;

            const [scoreA, scoreB] = match.score.split(":").map(Number);

            if (!teamStats[match.teamA]) teamStats[match.teamA] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
            if (!teamStats[match.teamB]) teamStats[match.teamB] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };

            teamStats[match.teamA].games += 1;
            teamStats[match.teamB].games += 1;

            teamStats[match.teamA].goals += scoreA;
            teamStats[match.teamB].goals += scoreB;

            teamStats[match.teamA].conceded += scoreB;
            teamStats[match.teamB].conceded += scoreA;

            teamStats[match.teamA].diff += scoreA - scoreB;
            teamStats[match.teamB].diff += scoreB - scoreA;

            if (scoreA > scoreB) {
                teamStats[match.teamA].points += 10;
            } else {
                teamStats[match.teamB].points += 10;
            }
        });

        onValue(teamsRef, (teamsSnapshot) => {
            teamsSnapshot.forEach((child) => {
                const team = child.val();
                if (!teamStats[team.name]) {
                    teamStats[team.name] = { games: 0, points: 0, goals: 0, conceded: 0, diff: 0 };
                }
            });

            const sortedTeams = Object.entries(teamStats).sort((a, b) => b[1].points - a[1].points || b[1].diff - a[1].diff || b[1].goals - a[1].goals);

            const newRanking = {};
            sortedTeams.forEach(([team, stats], index) => {
                newRanking[index + 1] = { ...stats, name: team, rank: index + 1 };
            });

            set(rankingRef, newRanking);
        });
    });
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    updateRanking();
};
