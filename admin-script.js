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
        const teamASelect = document.getElementById("teamA");
        const teamBSelect = document.getElementById("teamB");

        if (!teamList || !teamASelect || !teamBSelect) return;

        teamList.innerHTML = "";
        teamASelect.innerHTML = "";
        teamBSelect.innerHTML = "";

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

// SPIELE HINZUFÜGEN (Fix: Stellen sicher, dass das Spiel gespeichert wird und Matches aktualisiert werden)
export function addMatch() {
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    if (teamA && teamB && teamA !== teamB) {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" }).then(() => {
            loadMatches();
        });
    }
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
            const delBtn = document.createElement("button");
            delBtn.textContent = "🗑️";
            delBtn.onclick = () => remove(ref(db, "matches/" + child.key));
            li.appendChild(delBtn);
            matchList.appendChild(li);
        });
    });
}

// RANGLISTE LADEN (Fix: Alphabetische Sortierung, falls keine Punkte vorhanden sind)
export function loadRanking() {
    onValue(ref(db, "teams"), (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        let teams = [];
        snapshot.forEach((child) => {
            const data = child.val();
            teams.push(data);
        });
        teams.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));
        teams.forEach((team, index) => {
            rankingTable.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.games || 0}</td>
                <td>${team.points || 0}</td>
                <td>${team.goals || 0}</td>
                <td>${team.conceded || 0}</td>
                <td>${team.diff || 0}</td>
            </tr>`;
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
