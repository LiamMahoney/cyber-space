let express = require('express');
let sqlite = require('sqlite3');
let fs = require('fs');

let app = express();

app.use(express.static('public'));

app.get('/enemies', (req, res, next) => {
    fs.readFile('enemies.json', 'utf8', (err, data) => {
        if (err) {
            res.status(500);
            res.send(JSON.stringify("ERROR RETRIEVING ENEMY FILE: " + err.message));
        }
        res.end(data); //already stringified
    })
});

app.post('/score', (req, res, next) => {
    //TODO: 
    let db = new sqlite.Database('./db/scores.db');
    let userInput = '';

    req.on('data', (chunk) => {
        userInput += chunk;
    });

    req.on('end', () => {
        let userObj = JSON.parse(userInput);
        let sql = `INSERT INTO scores (score, name, date) VALUES (${userObj.score}, '${userObj.name}', DateTime('now'))`;
        db.run(sql, (err) => {
            if (err) {
                res.status(500);
                res.end(JSON.stringify(err.message));
            } else {
                res.status(200);
                res.end("Submitted");
            }
            db.close();
        });
    });
});

app.get('/score', (req, res, next) => {
    let db = new sqlite.Database('./db/scores.db');
    let scores = db.all("SELECT * FROM scores ORDER BY score DESC LIMIT 15", [], (err, rows) => {
        if (rows) {
            res.end(JSON.stringify(rows));
        }
        if (err) {
            res.status(500);
            res.end(JSON.stringify("ERROR GETTING SCORES: " + err.message));
        }
        db.close();
    })
});

app.get('/score/count', (req, res, next) => {
    let db = new sqlite.Database('./db/scores.db');
    let count = db.all("SELECT count(*) from scores", [], (err, rows) => {
        if (rows) {
            res.end(JSON.stringify(rows));
        } if (err) {
            res.status(500);
            res.end(JSON.stringify("ERROR GETTING SCORE COUNT: " + err.message));
        }
        db.close();
    });
});

app.listen(8080);

