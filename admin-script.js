import { db, ref, push, set, remove, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // PRÜFEN, OB ELEMENTE EXISTIEREN, BEVOR EVENTS HINZUGEFÜGT WERDEN
    const addTeamButton = document.getElementById("addTeam");
    if (addTeamButton) {
        addTeamButton.addEventListener("click", () => {
            const teamName = document.getElementById("teamName").value;
            const player1 = document.getElementById("player1").value;
            const player2 = document.getElementById("player2").value;

            if (teamName && player1 && player2) {
                const newTeamRef = push(teamsRef);
                set(newTeamRef, { name: teamName, player1, player2 });
                alert("Team erfolgreich hinzugefügt!");
                generateMatches();
            }
        });
    } else {
        console.error("❌ Fehler: Der Button 'addTeam' wurde nicht gefunden!");
    }

    const addNewsButton = document.getElementById("addNews");
    if (addNewsButton) {
        addNewsButton.addEventListener("click", () => {
            const newsText = document.getElementById("newsText").value;
            if (newsText) {
                const newNewsRef = push(newsRef);
                set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
                alert("News erfolgreich hinzugefügt!");
            }
        });
    } else {
        console.error("❌ Fehler: Der Button 'addNews' wurde nicht gefunden!");
    }

    // TEAMS LADEN UND MATCHES GENERIEREN
    function generateMatches() {
        onValue(teamsRef, (snapshot) => {
            const teams = [];
            snapshot.forEach((childSnapshot) => {
                teams.push(childSnapshot.val().name);
            });

            if (teams.length < 2) return;

            const existingMatches = {};
            onValue(matchesRef, (matchSnapshot) => {
                matchSnapshot.forEach((childSnapshot) => {
                    const match = childSnapshot.val();
                    existingMatches[`${match.team1}-${match.team2}`] = true;
                    existingMatches[`${match.team2}-${match.team1}`] = true;
                });

                teams.forEach((team1, i) => {
                    for (let j = i + 1; j < teams.length; j++) {
                        const team2 = teams[j];
                        if (!existingMatches[`${team1}-${team2}`]) {
                            const newMatchRef = push(matchesRef);
                            set(newMatchRef, { team1, team2, score: "-" });
                        }
                    }
                });
            });
        });
    }

    // MATCHES LADEN
    onValue(matchesRef, (snapshot) => {
        const upcomingTable = document.getElementById("upcomingMatches");
        const resultsTable = document.getElementById("resultsTable");

        if (!upcomingTable || !resultsTable) {
            console.error("❌ Fehler: Tabelle für Matches nicht gefunden!");
            return;
        }

        upcomingTable.innerHTML = "";
        resultsTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            const matchId = childSnapshot.key;

            if (match.score === "-") {
                upcomingTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td><button onclick="deleteMatch('${matchId}')">🗑️</button></td>
                </tr>`;
            } else {
                resultsTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>${match.score}</td>
                    <td><button onclick="editResult('${matchId}')">✏️</button></td>
                    <td><button onclick="deleteMatch('${matchId}')">🗑️</button></td>
                </tr>`;
            }
        });
    });

    // ERGEBNISSE SPEICHERN
    const saveResultButton = document.getElementById("saveResult");
    if (saveResultButton) {
        saveResultButton.addEventListener("click", () => {
            const team1 = document.getElementById("matchTeam1").value;
            const team2 = document.getElementById("matchTeam2").value;
            const score = document.getElementById("matchScore").value;

            if (team1 && team2 && score) {
                onValue(matchesRef, (snapshot) => {
                    snapshot.forEach((childSnapshot) => {
                        const match = childSnapshot.val();
                        const matchId = childSnapshot.key;
                        if (match.team1 === team1 && match.team2 === team2 && match.score === "-") {
                            set(ref(db, `matches/${matchId}`), { team1, team2, score });
                            alert("Ergebnis gespeichert!");
                        }
                    });
                });
            }
        });
    } else {
        console.error("❌ Fehler: Der Button 'saveResult' wurde nicht gefunden!");
    }

    // MATCH LÖSCHEN
    window.deleteMatch = (matchId) => {
        remove(ref(db, `matches/${matchId}`));
        alert("Match gelöscht!");
    };

    // ERGEBNIS BEARBEITEN
    window.editResult = (matchId) => {
        const newScore = prompt("Neues Ergebnis eingeben (z.B. 3:2):");
        if (newScore) {
            set(ref(db, `matches/${matchId}/score`), newScore);
            alert("Ergebnis aktualisiert!");
        }
    };
});
