import { database, ref, push, set, onValue, remove } from "./firebase.js";

// === NEWS VERWALTEN ===
// News hinzufügen
document.getElementById("addNewsBtn").addEventListener("click", function () {
    const newsText = document.getElementById("newsInput").value;
    if (newsText.trim() !== "") {
        const newsRef = ref(database, "news");
        push(newsRef, newsText);
        document.getElementById("newsInput").value = "";
    }
});

// News anzeigen
const newsRef = ref(database, "news");
onValue(newsRef, (snapshot) => {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const text = childSnapshot.val();

        const li = document.createElement("li");
        li.textContent = text;

        // Löschen-Button für News
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Löschen";
        deleteBtn.onclick = () => remove(ref(database, "news/" + key));

        li.appendChild(deleteBtn);
        newsList.appendChild(li);
    });
});

// === TEAMS VERWALTEN ===
// Teams hinzufügen
document.getElementById("addTeamBtn").addEventListener("click", function () {
    const teamName = document.getElementById("teamInput").value;
    if (teamName.trim() !== "") {
        const teamsRef = ref(database, "teams");
        push(teamsRef, teamName);
        document.getElementById("teamInput").value = "";
    }
});

// Teams anzeigen
const teamsRef = ref(database, "teams");
onValue(teamsRef, (snapshot) => {
    const teamList = document.getElementById("teamList");
    teamList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const name = childSnapshot.val();

        const li = document.createElement("li");
        li.textContent = name;

        // Löschen-Button für Teams
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Löschen";
        deleteBtn.onclick = () => remove(ref(database, "teams/" + key));

        li.appendChild(deleteBtn);
        teamList.appendChild(li);
    });
});

// === SPIELE VERWALTEN ===
// Spiel hinzufügen
document.getElementById("addMatchBtn").addEventListener("click", function () {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    if (team1 && team2 && team1 !== team2) {
        const matchesRef = ref(database, "matches");
        push(matchesRef, { team1, team2, score1: null, score2: null });
    }
});

// Spiele anzeigen
const matchesRef = ref(database, "matches");
onValue(matchesRef, (snapshot) => {
    const matchList = document.getElementById("matchList");
    matchList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const match = childSnapshot.val();

        const li = document.createElement("li");
        li.textContent = `${match.team1} vs. ${match.team2}`;

        // Ergebnis-Felder
        const input1 = document.createElement("input");
        input1.type = "number";
        input1.value = match.score1 !== null ? match.score1 : "";
        input1.placeholder = "Team 1 Tore";

        const input2 = document.createElement("input");
        input2.type = "number";
        input2.value = match.score2 !== null ? match.score2 : "";
        input2.placeholder = "Team 2 Tore";

        // Speichern-Button für Ergebnisse
        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Speichern";
        saveBtn.onclick = () => {
            const score1 = input1.value !== "" ? parseInt(input1.value) : null;
            const score2 = input2.value !== "" ? parseInt(input2.value) : null;
            set(ref(database, "matches/" + key), { ...match, score1, score2 });
        };

        // Löschen-Button für Spiele
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Löschen";
        deleteBtn.onclick = () => remove(ref(database, "matches/" + key));

        li.appendChild(input1);
        li.appendChild(input2);
        li.appendChild(saveBtn);
        li.appendChild(deleteBtn);
        matchList.appendChild(li);
    });
});

// === RANGLISTE ANZEIGEN ===
const rankingRef = ref(database, "ranking");
onValue(rankingRef, (snapshot) => {
    const rankingTable = document.getElementById("rankingTable");
    rankingTable.innerHTML = "";
    let rank = 1;
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rank}</td>
            <td>${data.team}</td>
            <td>${data.spiele}</td>
            <td>${data.punkte}</td>
            <td>${data.tore}</td>
            <td>${data.gegentore}</td>
            <td>${data.tordifferenz}</td>
        `;
        rankingTable.appendChild(row);
        rank++;
    });
});
