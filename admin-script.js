import { getDatabase, ref, push, set, onValue, remove } from "./firebase.js";

const database = getDatabase();

// === NEWS VERWALTEN ===
const newsRef = ref(database, "news");
const newsList = document.getElementById("newsList");

document.getElementById("addNewsBtn").addEventListener("click", function () {
    const newsText = document.getElementById("newsInput").value;
    if (newsText.trim() !== "") {
        push(newsRef, newsText);
        document.getElementById("newsInput").value = "";
    }
});

onValue(newsRef, (snapshot) => {
    newsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const text = childSnapshot.val();

        const li = document.createElement("li");
        li.textContent = text;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Löschen";
        deleteBtn.onclick = () => remove(ref(database, `news/${key}`));

        li.appendChild(deleteBtn);
        newsList.appendChild(li);
    });
});

// === TEAMS VERWALTEN ===
const teamsRef = ref(database, "teams");
const teamList = document.getElementById("teamList");

document.getElementById("addTeamBtn").addEventListener("click", function () {
    const teamName = document.getElementById("teamInput").value;
    if (teamName.trim() !== "") {
        push(teamsRef, teamName);
        document.getElementById("teamInput").value = "";
    }
});

onValue(teamsRef, (snapshot) => {
    teamList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const name = childSnapshot.val();

        const li = document.createElement("li");
        li.textContent = name;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Löschen";
        deleteBtn.onclick = () => remove(ref(database, `teams/${key}`));

        li.appendChild(deleteBtn);
        teamList.appendChild(li);
    });
});

// === SPIELE VERWALTEN ===
const matchesRef = ref(database, "matches");
const matchList = document.getElementById("matchList");
const resultsList = document.getElementById("resultsList");

document.getElementById("addMatchBtn").addEventListener("click", function () {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    if (team1 && team2 && team1 !== team2) {
        push(matchesRef, { team1, team2, score1: null, score2: null });
    }
});

onValue(matchesRef, (snapshot) => {
    matchList.innerHTML = "";
    resultsList.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
        const key = childSnapshot.key;
        const match = childSnapshot.val();

        const li = document.createElement("li");
        li.textContent = `${match.team1} vs. ${match.team2}`;

        const input1 = document.createElement("input");
        input1.type = "number";
        input1.value = match.score1 !== null ? match.score1 : "";
        input1.placeholder = "Team 1 Tore";

        const input2 = document.createElement("input");
        input2.type = "number";
        input2.value = match.score2 !== null ? match.score2 : "";
        input2.placeholder = "Team 2 Tore";

        const saveBtn = document.createElement("button");
        saveBtn.textContent = "Speichern";
        saveBtn.onclick = () => {
            const score1 = input1.value !== "" ? parseInt(input1.value) : null;
            const score2 = input2.value !== "" ? parseInt(input2.value) : null;
            set(ref(database, `matches/${key}`), { ...match, score1, score2 });
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Löschen";
        deleteBtn.onclick = () => remove(ref(database, `matches/${key}`));

        li.appendChild(input1);
        li.appendChild(input2);
        li.appendChild(saveBtn);
        li.appendChild(deleteBtn);

        if (match.score1 === null || match.score2 === null) {
            matchList.appendChild(li);
        } else {
            resultsList.appendChild(li);
        }
    });
});

// === RANGLISTE ANZEIGEN ===
const rankingRef = ref(database, "ranking");
const rankingTable = document.getElementById("rankingTable");

onValue(rankingRef, (snapshot) => {
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