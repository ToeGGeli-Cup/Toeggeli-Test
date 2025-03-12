import { db, ref, onValue, push, remove, update } from "./firebase.js";

// **News hinzufügen**
function addNews() {
    const newsInput = document.getElementById("newsInput");
    const newsRef = ref(db, "news");
    push(newsRef, { text: newsInput.value, date: new Date().toLocaleDateString() });
    newsInput.value = "";
}

// **News anzeigen & löschen**
onValue(ref(db, "news"), (snapshot) => {
    const newsList = document.getElementById("newsList");
    newsList.innerHTML = "";
    snapshot.forEach((child) => {
        const li = document.createElement("li");
        li.textContent = `${child.val().date}: ${child.val().text}`;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Löschen";
        deleteBtn.onclick = () => remove(ref(db, `news/${child.key}`));
        li.appendChild(deleteBtn);
        newsList.appendChild(li);
    });
});

// **Team hinzufügen**
function addTeam() {
    const teamName = document.getElementById("teamNameInput").value;
    const player1 = document.getElementById("player1Input").value;
    const player2 = document.getElementById("player2Input").value;
    push(ref(db, "teams"), { name: teamName, player1, player2 });
}

// **Teams anzeigen**
onValue(ref(db, "teams"), (snapshot) => {
    const teamSelects = [document.getElementById("team1Select"), document.getElementById("team2Select")];
    teamSelects.forEach(select => select.innerHTML = "");
    snapshot.forEach((child) => {
        const option = document.createElement("option");
        option.value = child.key;
        option.textContent = child.val().name;
        teamSelects.forEach(select => select.appendChild(option));
    });
});

// **Spiel hinzufügen**
function addMatch() {
    const team1 = document.getElementById("team1Select").value;
    const team2 = document.getElementById("team2Select").value;
    push(ref(db, "matches"), { team1, team2, score: null });
}

// **Spiele anzeigen (Offene & Resultate)**
onValue(ref(db, "matches"), (snapshot) => {
    const openMatchesList = document.getElementById("openMatchesList");
    const resultsList = document.getElementById("resultsList");
    openMatchesList.innerHTML = "";
    resultsList.innerHTML = "";

    snapshot.forEach((child) => {
        const match = child.val();
        const li = document.createElement("li");
        li.textContent = `${match.team1} vs. ${match.team2}`;

        if (match.score === null) {
            const input = document.createElement("input");
            input.placeholder = "Ergebnis (z.B. 10:8)";
            const btn = document.createElement("button");
            btn.textContent = "Speichern";
            btn.onclick = () => update(ref(db, `matches/${child.key}`), { score: input.value });
            li.appendChild(input);
            li.appendChild(btn);
            openMatchesList.appendChild(li);
        } else {
            li.textContent += ` - Ergebnis: ${match.score}`;
            resultsList.appendChild(li);
        }
    });
});
