import { db, ref, push, set, remove, onValue, update } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    // News hinzufügen
    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
            document.getElementById("newsText").value = "";
        }
    });

    // News anzeigen und löschen
    onValue(newsRef, (snapshot) => {
        const newsContainer = document.getElementById("newsContainer");
        newsContainer.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const newsItem = childSnapshot.val();
            newsContainer.innerHTML += `<p>${newsItem.date}: ${newsItem.text} 
                <button onclick="deleteNews('${childSnapshot.key}')">🗑️</button></p>`;
        });
    });

    window.deleteNews = (newsId) => {
        remove(ref(db, `news/${newsId}`));
    };

    // Teams hinzufügen
    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;

        if (teamName && player1 && player2) {
            const newTeamRef = push(teamsRef);
            set(newTeamRef, { name: teamName, player1: player1, player2: player2 });
            document.getElementById("teamName").value = "";
            document.getElementById("player1").value = "";
            document.getElementById("player2").value = "";
        }
    });

    // Teams anzeigen und bearbeiten
    onValue(teamsRef, (snapshot) => {
        const teamsTable = document.getElementById("teamsTable");
        teamsTable.innerHTML = "";
        snapshot.forEach((childSnapshot) => {
            const team = childSnapshot.val();
            teamsTable.innerHTML += `<tr>
                <td>${team.name}</td>
                <td>${team.player1}</td>
                <td>${team.player2}</td>
                <td>
                    <button onclick="editTeam('${childSnapshot.key}', '${team.name}', '${team.player1}', '${team.player2}')">🖊️</button>
                    <button onclick="deleteTeam('${childSnapshot.key}')">🗑️</button>
                </td>
            </tr>`;
        });
    });

    window.editTeam = (teamId, name, player1, player2) => {
        document.getElementById("teamName").value = name;
        document.getElementById("player1").value = player1;
        document.getElementById("player2").value = player2;
        document.getElementById("addTeam").onclick = () => {
            update(ref(db, `teams/${teamId}`), {
                name: document.getElementById("teamName").value,
                player1: document.getElementById("player1").value,
                player2: document.getElementById("player2").value
            });
        };
    };

    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
    };
});
