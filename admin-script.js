import { db, ref, push, set, remove, onValue } from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    const teamsRef = ref(db, "teams");
    const newsRef = ref(db, "news");
    const matchesRef = ref(db, "matches");

    document.getElementById("addTeam").addEventListener("click", () => {
        const teamName = document.getElementById("teamName").value;
        const player1 = document.getElementById("player1").value;
        const player2 = document.getElementById("player2").value;

        if (teamName && player1 && player2) {
            const newTeamRef = push(teamsRef);
            set(newTeamRef, { name: teamName, player1: player1, player2: player2 });
            alert("Team erfolgreich hinzugefügt!");
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
                <td><button onclick="deleteTeam('${childSnapshot.key}')">Löschen</button></td>
            </tr>`;
        });
    });

    window.deleteTeam = (teamId) => {
        remove(ref(db, `teams/${teamId}`));
        alert("Team gelöscht!");
    };

    document.getElementById("addNews").addEventListener("click", () => {
        const newsText = document.getElementById("newsText").value;
        if (newsText) {
            const newNewsRef = push(newsRef);
            set(newNewsRef, { text: newsText, date: new Date().toLocaleString() });
            alert("News erfolgreich hinzugefügt!");
        }
    });

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
        alert("News gelöscht!");
    };
});
