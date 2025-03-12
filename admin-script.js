import { db, ref, onValue } from "./firebase.js";

// Firebase-Konfiguration
const firebaseConfig = {
    apiKey: "DEINE_API_KEY",
    authDomain: "DEIN_AUTH_DOMAIN",
    databaseURL: "https://toeggeli-cup-2025-default-rtdb.europe-west1.firebasedatabase.app/",
    projectId: "toeggeli-cup-2025",
    storageBucket: "DEINE_STORAGE_BUCKET",
    messagingSenderId: "DEINE_MESSAGING_SENDER_ID",
    appId: "DEINE_APP_ID"
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔹 NEWS VERWALTEN
function addNews() {
    const newsText = document.getElementById("newsText").value;
    if (newsText.trim() === "") return;
    push(ref(db, "news"), { text: newsText, date: new Date().toLocaleDateString() });
    document.getElementById("newsText").value = "";
}

onValue(ref(db, "news"), (snapshot) => {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const news = childSnapshot.val();
        const li = document.createElement("li");
        li.innerHTML = `${news.date}: ${news.text} 
            <button class="delete-btn" onclick="deleteNews('${childSnapshot.key}')">🗑</button>`;
        newsList.appendChild(li);
    });
});

function deleteNews(newsId) {
    remove(ref(db, `news/${newsId}`));
}

// 🔹 TEAMS VERWALTEN
function addTeam() {
    const teamName = document.getElementById("teamName").value;
    if (teamName.trim() === "") return;
    set(ref(db, `teams/${teamName}`), { name: teamName });
    document.getElementById("teamName").value = "";
}

onValue(ref(db, "teams"), (snapshot) => {
    const teamsList = document.getElementById("teamsList");
    teamsList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        const li = document.createElement("li");
        li.innerHTML = `${team.name} 
            <button class="delete-btn" onclick="deleteTeam('${childSnapshot.key}')">🗑</button>`;
        teamsList.appendChild(li);
    });
});

function deleteTeam(teamId) {
    remove(ref(db, `teams/${teamId}`));
}

// 🔹 SPIELE VERWALTEN
function addMatch() {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    if (team1 === team2) return;
    set(ref(db, `matches/${team1}_vs_${team2}`), { team1, team2, score: "?" });
}

onValue(ref(db, "matches"), (snapshot) => {
    const matchesList = document.getElementById("matchesList");
    matchesList.innerHTML = "";
    snapshot.forEach((childSnapshot) => {
        const match = childSnapshot.val();
        const li = document.createElement("li");
        li.innerHTML = `${match.team1} vs. ${match.team2} - ${match.score} 
            <button class="delete-btn" onclick="deleteMatch('${childSnapshot.key}')">🗑</button>`;
        matchesList.appendChild(li);
    });
});

function deleteMatch(matchId) {
    remove(ref(db, `matches/${matchId}`));
}

// 🔹 RANGLISTE
onValue(ref(db, "ranking"), (snapshot) => {
    const rankingTable = document.getElementById("rankingTable");
    rankingTable.innerHTML = "";
    let rank = 1;
    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rank++}</td>
            <td>${childSnapshot.key}</td>
            <td>${team.games}</td>
            <td>${team.points}</td>
            <td>${team.goals}</td>
            <td>${team.conceded}</td>
            <td>${team.diff}</td>
        `;
        rankingTable.appendChild(row);
    });
});
