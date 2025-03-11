import { db, ref, set, push, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const newsRef = ref(db, "news");
    const teamsRef = ref(db, "teams");

    /*** NEWS HINZUFÜGEN & ANZEIGEN ***/
    document.getElementById("addNews").addEventListener("click", () => {
        const newsInput = document.getElementById("newsInput");
        if (newsInput.value.trim() !== "") {
            push(newsRef, { text: newsInput.value.trim() });
            newsInput.value = "";
        }
    });

    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            newsContainer.innerHTML += `<p>${childSnapshot.val().text} <button onclick="remove(ref(db, 'news/${childSnapshot.key}'))">🗑️</button></p>`;
        });
    });

    /*** TEAMS HINZUFÜGEN ***/
    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value.trim();
        const player1 = document.getElementById("player1").value.trim();
        const player2 = document.getElementById("player2").value.trim();

        if (teamName && player1 && player2) {
            push(teamsRef, { name: teamName, player1: player1, player2: player2 });
            document.getElementById("teamName").value = "";
            document.getElementById("player1").value = "";
            document.getElementById("player2").value = "";
        }
    });

    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teamsTable.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
                <td><button onclick="remove(ref(db, 'teams/${childSnapshot.key}'))">🗑️</button></td>
            </tr>`;
        });
    });
});
