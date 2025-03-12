import { db, ref, onValue, set, push, remove, update } from "./firebase.js";

// News hinzufügen
document.getElementById("addNewsBtn").addEventListener("click", () => {
    const newsText = document.getElementById("newsText").value;
    if (newsText.trim() === "") return;
    
    const newsRef = ref(db, "news/" + Date.now());
    set(newsRef, {
        date: new Date().toLocaleDateString("de-DE"),
        text: newsText
    });

    document.getElementById("newsText").value = "";
});

// News anzeigen und löschen
onValue(ref(db, "news"), (snapshot) => {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    snapshot.forEach((child) => {
        const li = document.createElement("li");
        li.textContent = `${child.val().date}: ${child.val().text}`;
        const btn = document.createElement("button");
        btn.textContent = "Löschen";
        btn.onclick = () => remove(ref(db, `news/${child.key}`));
        li.appendChild(btn);
        newsList.appendChild(li);
    });
});

// Team hinzufügen
document.getElementById("addTeamBtn").addEventListener("click", () => {
    const teamName = document.getElementById("teamName").value;
    if (teamName.trim() === "") return;

    const teamRef = ref(db, `teams/${teamName}`);
    set(teamRef, teamName);

    document.getElementById("teamName").value = "";
});

// Teams anzeigen und löschen
onValue(ref(db, "teams"), (snapshot) => {
    const teamList = document.getElementById("teamList");
    const team1 = document.getElementById("team1");
    const team2 = document.getElementById("team2");
    teamList.innerHTML = "";
    team1.innerHTML = "";
    team2.innerHTML = "";
    snapshot.forEach((child) => {
        const team = child.val();
        
        // Anzeige
        const li = document.createElement("li");
        li.textContent = team;
        const btn = document.createElement("button");
        btn.textContent = "Löschen";
        btn.onclick = () => remove(ref(db, `teams/${child.key}`));
        li.appendChild(btn);
        teamList.appendChild(li);

        // Dropdowns für Spiele
        const option1 = document.createElement("option");
        const option2 = document.createElement("option");
        option1.value = team;
        option1.textContent = team;
        option2.value = team;
        option2.textContent = team;
        team1.appendChild(option1);
        team2.appendChild(option2);
    });
});

// Spiel hinzufügen (ohne Ergebnis)
document.getElementById("addMatchBtn").addEventListener("click", () => {
    const team1 = document.getElementById("team1").value;
    const team2 = document.getElementById("team2").value;
    if (!team1 || !team2 || team1 === team2) return;

    const matchRef = ref(db, `matches/${team1}_vs_${team2}`);
    set(matchRef, {
        team1: team1,
        team2: team2,
        score: "-:-"
    });
});

// Offene Spiele anzeigen und Ergebnisse setzen
onValue(ref(db, "matches"), (snapshot) => {
    const openMatchesList = document.getElementById("openMatchesList");
    const resultList = document.getElementById("resultList");
    openMatchesList.innerHTML = "";
    resultList.innerHTML = "";

    snapshot.forEach((child) => {
        const match = child.val();
        const li = document.createElement("li");
        li.textContent = `${match.team1} vs. ${match.team2} (${match.score})`;

        if (match.score === "-:-") {
            // Ergebnis setzen
            const input = document.createElement("input");
            input.placeholder = "10:x";
            const btn = document.createElement("button");
            btn.textContent = "Speichern";
            btn.onclick = () => {
                update(ref(db, `matches/${child.key}`), { score: input.value });
            };
            li.appendChild(input);
            li.appendChild(btn);
            openMatchesList.appendChild(li);
        } else {
            // Bereits beendete Spiele
            resultList.appendChild(li);
        }
    });
});

// Rangliste aktualisieren
onValue(ref(db, "ranking"), (snapshot) => {
    const rankingTable = document.getElementById("rankingTable");
    rankingTable.innerHTML = "";
    let rank = 1;
    snapshot.forEach((child) => {
        const data = child.val();
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${rank++}</td>
            <td>${child.key}</td>
            <td>${data.games}</td>
            <td>${data.points}</td>
            <td>${data.goals}</td>
            <td>${data.conceded}</td>
            <td>${data.diff}</td>
        `;
        rankingTable.appendChild(row);
    });
});
