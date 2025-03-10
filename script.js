document.addEventListener("DOMContentLoaded", function() {
    fetch("turnierdaten.json")
        .then(response => response.json())
        .then(data => {
            updateNews(data.news);
            updateTeamsTable(data.teams);
            updateMatches(data.teams, data.results);
            updateRankingTable(data.teams, data.results);
        })
        .catch(error => console.error("Fehler beim Laden der Daten:", error));
});

function updateNews(news) {
    const newsContainer = document.getElementById("newsContainer");
    newsContainer.innerHTML = news.map(n => `<p>${n.date}: ${n.text}</p>`).join("");
}

function updateTeamsTable(teams) {
    const tbody = document.getElementById("teamsTable").querySelector("tbody");
    tbody.innerHTML = teams.map(team => `<tr><td>${team.name}</td><td>${team.player1}</td><td>${team.player2}</td></tr>`).join("");
}

function updateMatches(teams, results) {
    const tbody = document.getElementById("matchesTable").querySelector("tbody");
    let matches = [];
    for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
            let result = results.find(r => (r.team1 === teams[i].name && r.team2 === teams[j].name) || 
                                           (r.team1 === teams[j].name && r.team2 === teams[i].name));
            if (!result) {
                matches.push(`<tr><td>${teams[i].name}</td><td>${teams[j].name}</td></tr>`);
            }
        }
    }
    tbody.innerHTML = matches.join("");
}

function updateRankingTable(teams, results) {
    let rankings = teams.map(team => ({ name: team.name, games: 0, points: 0, goals: 0, conceded: 0, difference: 0 }));

    results.forEach(result => {
        let team1 = rankings.find(t => t.name === result.team1);
        let team2 = rankings.find(t => t.name === result.team2);
        team1.games++;
        team2.games++;
        team1.goals += result.score1;
        team2.goals += result.score2;
        team1.conceded += result.score2;
        team2.conceded += result.score1;
        team1.difference = team1.goals - team1.conceded;
        team2.difference = team2.goals - team2.conceded;
        if (result.score1 > result.score2) team1.points += 1;
        else if (result.score2 > result.score1) team2.points += 1;
    });

    rankings.sort((a, b) => b.points - a.points || b.difference - a.difference || b.goals - a.goals);
    const tbody = document.getElementById("rankingTable").querySelector("tbody");
    tbody.innerHTML = rankings.map(team => `<tr><td>${team.name}</td><td>${team.games}</td><td>${team.points}</td><td>${team.goals}</td><td>${team.conceded}</td><td>${team.difference}</td></tr>`).join("");
}
