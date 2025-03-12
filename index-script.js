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

// SPIELE HINZUFÜGEN
export function addMatch() {
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    if (teamA && teamB && teamA !== teamB) {
        push(ref(db, "matches"), { teamA, teamB, score: "-:-" });
    }
}

// ALLES LADEN
window.onload = function () {
    loadNews();
    loadTeams();
    loadMatches();
    loadRanking();
};
