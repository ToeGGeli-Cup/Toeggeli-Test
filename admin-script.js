import { db, ref, push, remove, set, onValue } from "./firebase.js";

// NEWS VERWALTEN
document.getElementById("addNews").addEventListener("click", () => {
    const newsText = document.getElementById("newsText").value.trim();
    if (newsText) {
        push(ref(db, "news"), {
            text: newsText,
            date: new Date().toLocaleDateString()
        });
        document.getElementById("newsText").value = "";
    }
});

// NEWS ANZEIGEN UND LÖSCHEN
onValue(ref(db, "news"), (snapshot) => {
    const newsContainer = document.getElementById("newsContainer");
    newsContainer.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const newsItem = childSnapshot.val();
        const key = childSnapshot.key;
        newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text}
            <button onclick="deleteNews('${key}')">Löschen</button></p>`;
    });
});

window.deleteNews = (key) => {
    remove(ref(db, `news/${key}`));
};

// TEAMS VERWALTEN
document.getElementById("addTeam").addEventListener("click", () => {
    const teamName = document.getElementById("teamName").value.trim();
    const player1 = document.getElementById("player1").value.trim();
    const player2 = document.getElementById("player2").value.trim();
    
    if (teamName && player1 && player2) {
        push(ref(db, "teams"), {
            name: teamName,
            player1: player1,
            player2: player2
        });
        document.getElementById("teamName").value = "";
        document.getElementById("player1").value = "";
        document.getElementById("player2").value = "";
    }
});

// TEAMS ANZEIGEN UND LÖSCHEN
onValue(ref(db, "teams"), (snapshot) => {
    const teamsTable = document.getElementById("teamsTable");
    const teamA = document.getElementById("teamA");
    const teamB = document.getElementById("teamB");

    teamsTable.innerHTML = "";
    teamA.innerHTML = "";
    teamB.innerHTML = "";

    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        const key = childSnapshot.key;

        teamsTable.innerHTML += `<tr>
            <td>${team.name}</td>
            <td>${team.player1}</td>
            <td>${team.player2}</td>
            <td><button onclick="deleteTeam('${key}')">Löschen</button></td>
        </tr>`;

        teamA.innerHTML += `<option value="${team.name}">${team.name}</option>`;
        teamB.innerHTML += `<option value="${team.name}">${team.name}</option>`;
    });
});

window.deleteTeam = (key) => {
    remove(ref(db, `teams/${key}`));
};

// SPIELE VERWALTEN
document.getElementById("addMatch").addEventListener("click", () => {
    const teamA = document.getElementById("teamA").value;
    const teamB = document.getElementById("teamB").value;
    const matchDate = document.getElementById("matchDate").value;

    if (teamA && teamB && matchDate && teamA !== teamB) {
        push(ref(db, "matches"), {
            teamA: teamA,
            teamB: teamB,
            date: matchDate,
            goalsA: 0,
            goalsB: 0
        });
    }
});

// SPIELE ANZEIGEN UND LÖSCHEN
onValue(ref(db, "matches"), (snapshot) => {
    const matchesTable = document.getElementById("matchesTable");
    matchesTable.innerHTML = "";
    
    snapshot.forEach((childSnapshot) => {
        const match = childSnapshot.val();
        const key = childSnapshot.key;

        matchesTable.innerHTML += `<tr>
            <td>${match.teamA}</td>
            <td>${match.teamB}</td>
            <td>${match.date}</td>
            <td>
                <input type="number" value="${match.goalsA}" onchange="updateResult('${key}', this.value, '${match.goalsB}')">
                :
                <input type="number" value="${match.goalsB}" onchange="updateResult('${key}', '${match.goalsA}', this.value)">
            </td>
            <td><button onclick="deleteMatch('${key}')">Löschen</button></td>
        </tr>`;
    });
});

// LÖSCHFUNKTIONEN FÜR SPIELE UND NEWS
window.deleteMatch = (key) => {
    remove(ref(db, `matches/${key}`));
};

window.updateResult = (key, goalsA, goalsB) => {
    set(ref(db, `matches/${key}/goalsA`), parseInt(goalsA, 10));
    set(ref(db, `matches/${key}/goalsB`), parseInt(goalsB, 10));
};
