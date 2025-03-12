import { db, ref, push, remove, update, onValue } from "./firebase.js";

// NEWS
function addNews() {
    let newsInput = document.getElementById("newsInput").value;
    if (newsInput.trim() !== "") {
        push(ref(db, "news"), { text: newsInput });
        document.getElementById("newsInput").value = "";
    }
}

function deleteNews(id) {
    remove(ref(db, "news/" + id));
}

onValue(ref(db, "news"), (snapshot) => {
    let newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    snapshot.forEach((child) => {
        let li = document.createElement("li");
        li.textContent = child.val().text;
        let delBtn = document.createElement("button");
        delBtn.textContent = "❌";
        delBtn.onclick = () => deleteNews(child.key);
        li.appendChild(delBtn);
        newsList.appendChild(li);
    });
});

// TEAMS
function addTeam() {
    let teamInput = document.getElementById("teamInput").value;
    if (teamInput.trim() !== "") {
        push(ref(db, "teams"), { name: teamInput });
        document.getElementById("teamInput").value = "";
    }
}

function deleteTeam(id) {
    remove(ref(db, "teams/" + id));
}

onValue(ref(db, "teams"), (snapshot) => {
    let teamList = document.getElementById("teamList");
    teamList.innerHTML = "";
    let team1Select = document.getElementById("team1");
    let team2Select = document.getElementById("team2");
    team1Select.innerHTML = "";
    team2Select.innerHTML = "";
    snapshot.forEach((child) => {
        let li = document.createElement("li");
        li.textContent = child.val().name;
        let delBtn = document.createElement("button");
        delBtn.textContent = "❌";
        delBtn.onclick = () => deleteTeam(child.key);
        li.appendChild(delBtn);
        teamList.appendChild(li);
        let option1 = document.createElement("option");
        let option2 = document.createElement("option");
        option1.value = option2.value = child.key;
        option1.textContent = option2.textContent = child.val().name;
        team1Select.appendChild(option1);
        team2Select.appendChild(option2);
    });
});

// SPIELE
function addGame() {
    let team1 = document.getElementById("team1").value;
    let team2 = document.getElementById("team2").value;
    if (team1 && team2 && team1 !== team2) {
        push(ref(db, "games"), { team1, team2, score1: null, score2: null });
    }
}

function deleteGame(id) {
    remove(ref(db, "games/" + id));
}

onValue(ref(db, "games"), (snapshot) => {
    let gameList = document.getElementById("gameList");
    gameList.innerHTML = "";
    let resultsList = document.getElementById("resultsList");
    resultsList.innerHTML = "";
    snapshot.forEach((child) => {
        let game = child.val();
        let li = document.createElement("li");
        li.textContent = `${game.team1} vs. ${game.team2}`;
        let delBtn = document.createElement("button");
        delBtn.textContent = "❌";
        delBtn.onclick = () => deleteGame(child.key);
        li.appendChild(delBtn);
        if (game.score1 !== null && game.score2 !== null) {
            resultsList.appendChild(li);
        } else {
            gameList.appendChild(li);
        }
    });
});

// RANGLISTE
onValue(ref(db, "teams"), (snapshot) => {
    let rankings = [];
    snapshot.forEach((child) => {
        rankings.push({
            name: child.val().name,
            games: 0,
            points: 0,
            goals: 0,
            conceded: 0,
            diff: 0,
        });
    });

    onValue(ref(db, "games"), (gameSnapshot) => {
        gameSnapshot.forEach((child) => {
            let game = child.val();
            if (game.score1 !== null && game.score2 !== null) {
                let team1 = rankings.find((t) => t.name === game.team1);
                let team2 = rankings.find((t) => t.name === game.team2);
                if (team1 && team2) {
                    team1.games++;
                    team2.games++;
                    team1.goals += game.score1;
                    team1.conceded += game.score2;
                    team2.goals += game.score2;
                    team2.conceded += game.score1;
                    team1.diff = team1.goals - team1.conceded;
                    team2.diff = team2.goals - team2.conceded;
                    if (game.score1 > game.score2) {
                        team1.points += 3;
                    } else if (game.score1 < game.score2) {
                        team2.points += 3;
                    } else {
                        team1.points += 1;
                        team2.points += 1;
                    }
                }
            }
        });

        rankings.sort((a, b) => b.points - a.points || b.diff - a.diff);
        let rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        rankings.forEach((team, index) => {
            let row = `<tr>
                <td>${index + 1}</td>
                <td>${team.name}</td>
                <td>${team.games}</td>
                <td>${team.points}</td>
                <td>${team.goals}</td>
                <td>${team.conceded}</td>
                <td>${team.diff}</td>
            </tr>`;
            rankingTable.innerHTML += row;
        });
    });
});
