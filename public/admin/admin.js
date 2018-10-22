function authenticate() {
    if (document.getElementById("password").value === "FluffyHippo") {
        getScores();
        getScoreCount();
    } else {
        //TODO: u kno
    }
}

function getScores() {
    let xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
            displayScores(JSON.parse(xhttp.responseText));
        } else if (xhttp.readystate === xhttp.DONE && xhttp.status !== 200) {
            postError(xhttp.responseText);
        }
    };

    xhttp.open("GET", "../score", true);
    xhttp.send(null);
}

function displayScores(list) {
    let html = `<div style="text-align: center;">ALL SCORES:</div><div class="score-container"><div class="flex-row"><div class="flex-col">RANK</div><div class="flex-col">SCORE</div><div class="flex-col">NAME</div><div class="flex-col">SEGMENT</div><div class="flex-col">EMAIL</div><div class="flex-col">DATE</div></div>`
    for (var i = 0; i < list.length; i++) {
        html += `
        <div class="flex-row">
            <div class="flex-col">${i + 1}</div>
            <div class="flex-col">${list[i].score}</div>
            <div class="flex-col">${list[i].name}</div>
            <div class="flex-col">${list[i].segment}</div>
            <div class="flex-col">${list[i].email}</div>
            <div class="flex-col">${list[i].date}</div>
        </div>
        `;
    }
    html += `</div>`;

    document.querySelector('.flex-container').innerHTML = html;
}

function getScoreCount() {
    let xhttp = new XMLHttpRequest();
    
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
            displayScoreCount(JSON.parse(xhttp.responseText));
        } else if (xhttp.readyState === xhttp.DONE && xhttp.status != 200) {
            postError(xhttp.responseText);
        }
    };

    xhttp.open("GET", "../score/count", true);
    xhttp.send(null);
}

function displayScoreCount(row) {
    document.querySelector('.flex-container').innerHTML += "<div>Number of scores submitted: " + row[0]["count(*)"] + "</div>";
}