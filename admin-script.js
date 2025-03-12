import { getDatabase, ref, set, push, update, remove, onValue } from "./firebase.js";

const db = getDatabase();

// 📰 News CRUD
function addNews() {
    const text = document.getElementById("newsText").value;
    if (text) {
        set(ref(db, "news/" + text.replace(/\s+/g, "_")), { text });
        document.getElementById("newsText").value = "";
    }
}

function deleteNews(newsId) {
    remove(ref(db, "news/" + newsId));
}

onValue(ref(db, "news"), (snapshot) => {
    const list = document.getElementById("newsList");
    list.innerHTML = "";
    snapshot.forEach((child) => {
        const li = document.createElement("li");
        li.innerHTML = `${child.val().text} <button onclick="deleteNews('${child.key}')">🗑</button>`;
        list.appendChild(li);
    });
});

// 🏆 Teams CRUD
function addTeam() {
    const name = document.getElementById("teamName").value;
    if (name) {
        set(ref(db, "teams/" + name.replace(/\s+/g, "_")), { name });
        document.getElementById("teamName").value = "";
    }
}

function deleteTeam(teamName) {
    remove(ref(db, "teams/" + teamName));
}

onValue(ref(db, "teams"), (snapshot) => {
    const list = document.getElementById("teamsList");
    const select1 = document.getElementById("team1");
    const select2 = document.getElementById("team2");

    list.innerHTML = "";
    select1.innerHTML = "";
    select2.innerHTML = "";

    snapshot.forEach((child) => {
        const name = child.val().name;
        const li = document.createElement("li");
        li.innerHTML = `${name} <button onclick="deleteTeam('${child.key}')">🗑</button>`;
        list.appendChild(li);

        const option1 = document.createElement("option");
        option1.value = name;
        option1.textContent = name;
        select1.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = name;
        option2.textContent = name;
        select2.appendChild(option2);
    });
});

// ⚽ Matches CRUD
function addMatch() {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    if (team1 && team2 && team1 !== team2) {
        set(ref(db, "matches/" + team1 + "_vs_" + team2), { team1, team2 });
    }
}

function deleteMatch(matchId) {
    remove(ref(db, "matches/" + matchId));
}

onValue(ref(db, "matches"), (snapshot) => {
    const list = document.getElementById("matchesList");
    list.innerHTML = "";
    snapshot.forEach((child) => {
        const match = child.val();
        const li = document.createElement("li");
        li.innerHTML = `${match.team1} vs. ${match.team2} 
                        <button onclick="deleteMatch('${child.key}')">🗑</button>`;
        list.appendChild(li);
    });
});

// 📊 Ergebnisse und Rangliste
onValue(ref(db, "ranking"), (snapshot) => {
    const table = document.getElementById("rankingTable");
    table.innerHTML = "";
    let rank = 1;
    snapshot.forEach((child) => {
        const team = child.key;
        const data = child.val();
        const row = document.createElement("tr");
        row.innerHTML = `<td>${rank++}</td>
                         <td>${team}</td>
                         <td>${data.games || 0}</td>
                         <td>${data.points || 0}</td>
                         <td>${data.goals || 0}</td>
                         <td>${data.conceded || 0}</td>
                         <td>${data.diff || 0}</td>`;
        table.appendChild(row);
    });
});

export { addNews, deleteNews, addTeam, deleteTeam, addMatch, deleteMatch };
