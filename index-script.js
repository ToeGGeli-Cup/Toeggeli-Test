import { db, ref, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const matchesRef = ref(db, "matches");
    const rankingRef = ref(db, "ranking");

    // Spiele anzeigen
    onValue(matchesRef, (snapshot) => {
        const upcomingTable = document.getElementById("upcomingTable");
        const resultsTable = document.getElementById("resultsTable");
        upcomingTable.innerHTML = "";
        resultsTable.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const match = childSnapshot.val();
            if (match.score === "-") {
                upcomingTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                </tr>`;
            } else {
                resultsTable.innerHTML += `<tr>
                    <td>${match.team1}</td>
                    <td>${match.team2}</td>
                    <td>${match.score}</td>
                </tr>`;
            }
        });
    });

    // Rangliste anzeigen
    onValue(rankingRef, (snapshot) => {
        const rankingTable = document.getElementById("rankingTable");
        rankingTable.innerHTML = "";
        Object.keys(snapshot.val() || {}).forEach((team, index) => {
            const data = snapshot.val()[team];
            rankingTable.innerHTML += `<tr>
                <td>${index + 1}</td>
                <td>${team}</td>
                <td>${data.games}</td>
                <td>${data.points}</td>
                <td>${data.goals}</td>
                <td>${data.conceded}</td>
                <td>${data.diff}</td>
            </tr>`;
        });
    });
});
