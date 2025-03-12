import { db, ref, push, set, onValue, remove } from "./firebase.js";

// NEWS VERWALTEN
function addNews() {
    const newsText = document.getElementById("newsInput").value;
    if (newsText.trim() === "") return;
    
    const newsRef = ref(db, "news");
    const newNewsRef = push(newsRef);
    set(newNewsRef, newsText);

    document.getElementById("newsInput").value = "";
}

function loadNews() {
    const newsList = document.getElementById("newsList");
    const newsRef = ref(db, "news");

    onValue(newsRef, (snapshot) => {
        newsList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const li = document.createElement("li");
            li.textContent = childSnapshot.val();
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Löschen";
            deleteBtn.onclick = () => remove(ref(db, `news/${childSnapshot.key}`));
            li.appendChild(deleteBtn);
            newsList.appendChild(li);
        });
    });
}

// TEAMS VERWALTEN
function addTeam() {
    const teamName = document.getElementById("teamInput").value;
    if (teamName.trim() === "") return;
    
    const teamRef = ref(db, "teams");
    const newTeamRef = push(teamRef);
    set(newTeamRef, teamName);

    document.getElementById("teamInput").value = "";
}

function loadTeams() {
    const teamList = document.getElementById("teamList");
    const teamRef = ref(db, "teams");

    onValue(teamRef, (snapshot) => {
        teamList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const li = document.createElement("li");
            li.textContent = childSnapshot.val();
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Löschen";
            deleteBtn.onclick = () => remove(ref(db, `teams/${childSnapshot.key}`));
            li.appendChild(deleteBtn);
            teamList.appendChild(li);
        });
    });
}

// SPIELE VERWALTEN
function addMatch() {
    const team1 = document.getElementById("team1Input").value;
    const team2 = document.getElementById("team2Input").value;
    if (team1.trim() === "" || team2.trim() === "") return;

    const matchRef = ref(db, "matches");
    const newMatchRef = push(matchRef);
    set(newMatchRef, { team1, team2, score1: null, score2: null });

    document.getElementById("team1Input").value = "";
    document.getElementById("team2Input").value = "";
}

function loadMatches() {
    const matchList = document.getElementById("matchList");
    const matchRef = ref(db, "matches");

    onValue(matchRef, (snapshot) => {
        matchList.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const data = childSnapshot.val();
            const li = document.createElement("li");
            li.textContent = `${data.team1} vs ${data.team2}`;
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Löschen";
            deleteBtn.onclick = () => remove(ref(db, `matches/${childSnapshot.key}`));
            li.appendChild(deleteBtn);
            matchList.appendChild(li);
        });
    });
}

// RANGLISTE LADEN
function loadRanking() {
    const rankingTable = document.getElementById("rankingTable");
    const matchRef = ref(db, "matches");

    onValue(matchRef, (snapshot) => {
        const rankings = {};
        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score1 !== null && match.score2 !== null) {
                [match.team1, match.team2].forEach((team) => {
                    if (!rankings[team]) rankings[team] = { games: 0, points: 0, goals: 0, conceded: 0 };
                });

                rankings[match.team1].games++;
                rankings[match.team2].games++;

                rankings[match.team1].goals += match.score1;
                rankings[match.team2].goals += match.score2;
                rankings[match.team1].conceded += match.score2;
                rankings[match.team2].conceded += match.score1;

                if (match.score1 > match.score2) {
                    rankings[match.team1].points += 3;
                } else if (match.score1 < match.score2) {
                    rankings[match.team2].points += 3;
                } else {
                    rankings[match.team1].points++;
                    rankings[match.team2].points++;
                }
            }
        });

        rankingTable.innerHTML = "";
        Object.entries(rankings)
            .sort(([, a], [, b]) => b.points - a.points || (b.goals - b.conceded) - (a.goals - a.conceded))
            .forEach(([team, data], i) => {
                const row = `<tr><td>${i + 1}</td><td>${team}</td><td>${data.games}</td><td>${data.points}</td>
                             <td>${data.goals}</td><td>${data.conceded}</td><td>${data.goals - data.conceded}</td></tr>`;
                rankingTable.innerHTML += row;
            });
    });
}

// SEITENLADE-EVENTS
window.onload = () => {
    loadNews();
    loadTeams();
    loadMatches();
    loadRanking();
};
