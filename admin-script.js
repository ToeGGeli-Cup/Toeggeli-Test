import { database, ref, set, push, remove, update, onValue } from "./firebase.js";

// Teams-Referenz in der Datenbank
const teamsRef = ref(database, "teams");
const matchesRef = ref(database, "matches");

// Teams aus Firebase laden und anzeigen
onValue(teamsRef, (snapshot) => {
    const teamsTable = document.getElementById("teamsTable");
    teamsTable.innerHTML = "<tr><th>Name</th><th>Spieler 1</th><th>Spieler 2</th><th>Aktion</th></tr>";

    snapshot.forEach((childSnapshot) => {
        const team = childSnapshot.val();
        const teamKey = childSnapshot.key;
        const row = teamsTable.insertRow();

        row.insertCell(0).innerText = team.name;
        row.insertCell(1).innerText = team.player1;
        row.insertCell(2).innerText = team.player2;

        // Team löschen Button
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Löschen";
        deleteButton.onclick = () => remove(ref(database, "teams/" + teamKey));
        row.insertCell(3).appendChild(deleteButton);
    });
});

// Neues Team hinzufügen
document.getElementById("addTeamForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("teamName").value.trim();
    const player1 = document.getElementById("player1").value.trim();
    const player2 = document.getElementById("player2").value.trim();

    if (name && player1 && player2) {
        push(teamsRef, { name, player1, player2 });
        document.getElementById("addTeamForm").reset();
    } else {
        alert("Bitte alle Felder ausfüllen!");
    }
});

// Spiele aus Firebase laden und anzeigen
onValue(matchesRef, (snapshot) => {
    const matchesTable = document.getElementById("matchesTable");
    matchesTable.innerHTML = "<tr><th>Team 1</th><th>Team 2</th><th>Ergebnis</th><th>Aktion</th></tr>";

    snapshot.forEach((childSnapshot) => {
        const match = childSnapshot.val();
        const matchKey = childSnapshot.key;
        const row = matchesTable.insertRow();

        row.insertCell(0).innerText = match.team1;
        row.insertCell(1).innerText = match.team2;

        // Ergebnisfeld
        const scoreInput = document.createElement("input");
        scoreInput.type = "text";
        scoreInput.value = match.score || "";
        row.insertCell(2).appendChild(scoreInput);

        // Speichern-Button
        const saveButton = document.createElement("button");
        saveButton.innerText = "Speichern";
        saveButton.onclick = () => {
            update(ref(database, "matches/" + matchKey), { score: scoreInput.value });
        };
        row.insertCell(3).appendChild(saveButton);

        // Löschen-Button für Spiel
        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Löschen";
        deleteButton.onclick = () => remove(ref(database, "matches/" + matchKey));
        row.insertCell(3).appendChild(deleteButton);
    });
});

// Neues Spiel hinzufügen
document.getElementById("addMatchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const team1 = document.getElementById("matchTeam1").value.trim();
    const team2 = document.getElementById("matchTeam2").value.trim();

    if (team1 && team2 && team1 !== team2) {
        push(matchesRef, { team1, team2, score: "" });
        document.getElementById("addMatchForm").reset();
    } else {
        alert("Ungültige Eingabe! Teams müssen unterschiedlich sein.");
    }
});
