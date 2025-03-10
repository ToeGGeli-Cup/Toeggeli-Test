import { db, ref, push, set, remove } from "./firebase.js";

function addTeam() {
    const teamName = document.getElementById("teamName").value;
    const player1 = document.getElementById("player1").value;
    const player2 = document.getElementById("player2").value;
    
    if (teamName && player1 && player2) {
        push(ref(db, "teams"), { name: teamName, player1, player2 });
    }
}

function addNews() {
    const newsText = document.getElementById("newsText").value;
    push(ref(db, "news"), newsText);
}

window.addTeam = addTeam;
window.addNews = addNews;
