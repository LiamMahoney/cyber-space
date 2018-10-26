//FIXME: Create quiz menu for additional points
//TODO: update score on screen as soon as round is over
 {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var triedent = ua.indexOf("Trident/");

    if (msie !== -1 || triedent !== -1) {
        document.getElementById("NO-IE").innerHTML = "<div class='no-ie'><img src='/pics/title.png'><div class='no-ie-text'>Internet Explorer is not supported for this game. Please use Google Chrome or Microsoft Edge. Sorry for any inconvinience. </div></div>"
        document.getElementById("NO-IE").className += " no-ie-css";
    } else {

    var type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) {
        type = "canvas";
    }
    
    PIXI.utils.sayHello(type); // puts pixi.js in console
    
    var app = new PIXI.Application({width: 1000, height: 600});
    // document.body.appendChild(app.view);
    document.querySelector(".game-container").appendChild(app.view);
    
    //Start background
    var texture = PIXI.Texture.fromImage('pics/background.png');
    var tilingSprite = new PIXI.extras.TilingSprite(texture, 1000, 2000);
    app.stage.addChild(tilingSprite);
    
    app.ticker.add(function()  {
        tilingSprite.tilePosition.y -= 1;
    });
    //End background
    
    //Adding images so they can be used
    //FIXME: Load enemy pictures dynamically
    PIXI.loader.add(['pics/title.png', 'pics/user.png', 'pics/ammo.png', 'pics/enemyAmmo.png', 'pics/menuBackground.png', 'pics/controls.png', 'pics/startButton.png', 'pics/nextButton.png', 'pics/life.png', 'pics/1Phishing.png', 'pics/2MaliciousLink.png', 'pics/3MaliciousAttachment.png', 'pics/4Malware.png', 'pics/5Ransomware.png', 'pics/6Vishing.png', 'pics/7InsiderRisk.png', 'pics/8Cybercriminal.png']).load(initialSetup);
    
    var state = menu;
    var user;
    var userAmmoList = [];
    var enemyList = []; // list of enemy sprites
    var enemyAmmoList = [];
    var enemyAmmoVX = 5; 
    var enemyVX = 2;
    var enemyFireRate = 300; //larger numbers are slower
    var enemyDirectionChange = 1;
    var roundNumber = 1;
    var enemyTypeList;
    var score = 0;
    var roundScore = 0;
    var lives = 3;
    var keyboardListenerSet = false;
    var userwon = false;
    
    var titleStyle = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 26,
        fill: "rgb(252, 212, 6)"
    });
    var headerStyle = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 36,
        fill: "rgb(252, 212, 6)"
    });
    var textStyle = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 18,
        fill: "white",
        wordWrap: true,
        wordWrapWidth: 600
    });
    var objectiveStyle = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 24,
        fill: "white",
        wordWrap: true,
        wordWrapWidth: 600
    });
    var quizInstructionsStyle = new PIXI.TextStyle({
        fontFamily: "Arial",
        fontSize: 18,
        fill: "rgb(252, 212, 6)",
        wordWrap: true,
        wordWrapWidth: 600
    });
    
    function initialSetup() {
        // state = play;
        app.ticker.add(function(delta) {gameLoop(delta)});
        getEnemyObj();
        titleMenu();
    }
    function getEnemyObj() {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState === XMLHttpRequest.DONE) {
                enemyTypeList = JSON.parse(xhttp.responseText);
            }
        }
    
        xhttp.open("GET", "./enemies", true);
        xhttp.send(null);
    }
    function setup() {
        userwon = false;
        initializeLifeCounter();
        initializeThreatIdentifier();
        initializeUser();

        initializeEnemies();
        if (!keyboardListenerSet) {
            keyboardListenerSet = true;
            keyboardListener(); 
        }   
    }
    function initializeEnemies() {
        var enemy = enemyTypeList[roundNumber - 1];

        for (i = 0; i < 8; i++) {
            var tempEnemy = new PIXI.Sprite(PIXI.loader.resources['pics/' + enemy.picture].texture);
            if (!enemyList[i - 1]) {
                tempEnemy.position.set(0, 30);
            } else {
                tempEnemy.position.set(enemyList[i - 1].x + 100, 30);
            }
            tempEnemy.width = 30;
            tempEnemy.height = 30;
            app.stage.addChild(tempEnemy);
            enemyList.push(tempEnemy);
        }
    }
    function initializeUser() {
        user = new PIXI.Sprite(
            PIXI.loader.resources['pics/user.png'].texture
        );
        user.height = 40;
        user.width = 40;
        user.position.set(480, 560);
        user.vx = 0;
        user.length = 1;
        app.stage.addChild(user); //app.stage/removeChild(user);
    }
    function initializeThreatIdentifier() {
        var threatIdentifier = new PIXI.Text(enemyTypeList[roundNumber - 1].name, textStyle);
        threatIdentifier.x = (app.stage.width - threatIdentifier.width) / 2;
        app.stage.addChild(threatIdentifier);
    }
    function initializeLifeCounter() {
        for (i = 0; i < lives; i++) { //purposefully makes i available after for loop
            var tempLifePic = new PIXI.Sprite(PIXI.loader.resources['pics/life.png'].texture);
            tempLifePic.x = app.stage.width - ((i + 1) * tempLifePic.width);
            tempLifePic.y = 3;
            app.stage.addChild(tempLifePic);
        }
        var livesText = new PIXI.Text("LIVES: ", textStyle);
        livesText.y = 0;
        livesText.x = app.stage.width - ((i * 15) + livesText.width);
        app.stage.addChild(livesText);
    }
    
    function gameLoop(delta) {
        state(delta);
    }
    
    //Main looping function for the round. 
    function play (delta) {
        //updates live score
        app.stage.children[1].text = "SCORE: " + (score + roundScore);
    
        var enemyVY = 0;             
        updateUserAmmo(delta);
        // incrases fire rate
        if (enemyList.length < 5) {
            enemyFireRate = 150 - ((roundNumber - 1) * 20);
        }
        //round still going on
        if (enemyList.length > 0) {
            updateEnemyY();
            updateEnemy(enemyVY);
            updateEnemyAmmo(delta);
        } else {
            userWon();
        }
        
        //Prevents user from moving any futher right
        if (user.vx > 0) {
            if (user.x > 960) {
                user.vx = 0;
            }
        }
        //Prevents user from moving any further left
        if (user.vx < 0) {
            if (user.x < 0) {
                user.vx = 0;
            }
        } 
    
        user.x += user.vx;
    }
    function updateUserAmmo(delta) {
        //Updates ammo position (makes ammo move)
        for (var i = 0; i < userAmmoList.length; i++) {
            userAmmoList[i].y -= (5 + delta);
            var hit = hitTest(userAmmoList[i], enemyList);
            if (hit) {
                app.stage.removeChild(userAmmoList[i]);
                roundScore += 25;
            }
            //Removes ammos that have gone out of view
            if (userAmmoList[i].y < -5) {
                userAmmoList.splice(i, 1);
            }
        }
    }
    function updateEnemy(enemyVY) {
        // updates enemy position
        for (var i = 0; i < enemyList.length; i++) {
            //changing position of enemy
            enemyList[i].x += enemyVX;
            enemyList[i].y += enemyVY;

            // randomly creates enemy fire
            // higher enemyFireRate = lower fire rate (smaller chance of random equaling 4)
            if (Math.floor(Math.random() * enemyFireRate + 1) === 4) {
                var tempEnemyAmmo = new PIXI.Sprite(PIXI.loader.resources['pics/enemyAmmo.png'].texture);
                tempEnemyAmmo.position.set(enemyList[i].x + 8, enemyList[i].y + 20);
                if (enemyVX > 0) {
                    tempEnemyAmmo.vx = 1;
                } else {
                    tempEnemyAmmo.vx = -1;
                }
                app.stage.addChild(tempEnemyAmmo);
                enemyAmmoList.push(tempEnemyAmmo);
            }
            if (enemyList[i].y > 500) {
                //enemy won
                removeStageChildren(2);
                lives = lives - 1;
                roundScore = 0;
                if (lives === 0) { //due to limitations to scoreboard
                    score -= 40;
                }
                enemyFireRate = 300 - (20 * (roundNumber - 1));
                roundMenuHelper();
                state = menu;
                enemyAmmoList = [];
                enemyList = [];
                userAmmoList = [];

            }
        }
    }
    function updateEnemyAmmo(delta) {
        // updates enemy ammo position 
        for (var i = 0; i < enemyAmmoList.length; i++) {
            enemyAmmoList[i].y += enemyAmmoVX + delta;
            // enemyAmmo objects have the direction the enemy was moving when it fired 
            // incorporated as it's .vx attribute
            enemyAmmoList[i].x += enemyAmmoList[i].vx;
    
            // removes enemmy ammo objects that are out of the view
            if (enemyAmmoList[i].y > 1005) {
                app.stage.removeChild(enemyAmmoList[i]);
                enemyAmmoList.splice(i, 1);
            } else {
                //hit between user and enemy ammo, only need to check if ammo
                // is still on screen
                var hit = hitTestHelper(enemyAmmoList[i], user);
                if (hit) {
                    //enemy won
                    app.stage.removeChild(enemyAmmoList[i]);
                    //enemyAmmoList.splice(i, 1);
                    app.stage.removeChild(user);
                    removeStageChildren(2);
                    lives = lives - 1;
                    user.alive = false;
                    roundScore = 0;
                    if (lives === 0) {
                        score -= 40;
                    }
                    roundMenuHelper();
                    state = menu;
                    enemyFireRate = 300 - (20 * (roundNumber - 1));
               
                }
            }
        }
    }
    function userWon() {
        app.stage.children[1].text = "SCORE: " + (score + roundScore);
        //user won
        userwon = true;
        removeStageChildren(2);
        score += roundScore;
        roundScore = 0;
        state = menu;
        roundNumber++;
        // roundMenuHelper();
        quizMenuHelper();
        enemyFireRate = 300 - (20 * (roundNumber - 1));
    }
    function updateEnemyY() {
        // update enemyY
        if (enemyVX > 0) {
            if (enemyList[enemyList.length - 1].x >= 980) {
                enemyVX = -2;
                //moves enemies down one row
                enemyVY = 20;
            }
        } else if (enemyVX < 0) {
            if (enemyList[0].x <= 0) {
                enemyVX = 2;
                enemyVY = 20;
            }
        }
    }
    //Used as state for menu
    function menu() {
    
    }
    
    //MENUS AND ASSOCIATED FUNCTIONS BELOW//
    function titleMenu() {
        var title = new PIXI.Sprite(PIXI.loader.resources['pics/title.png'].texture);
        title.x = (app.stage.width - 1000) / 2;
        title.width = 1000;
        title.height = 276.6;
        app.stage.addChild(title);
    
        
        var startButton = new PIXI.Sprite(PIXI.loader.resources['pics/startButton.png'].texture);
        startButton.y = 500;
        startButton.x = (app.stage.width - startButton.width) / 2;
        startButton.buttonMode = true;
        startButton.interactive = true;
        startButton.on('mouseup', objectiveMenuHelper);
        app.stage.addChild(startButton);
    }
    function objectiveMenuHelper() {
        removeStageChildren(1);
        objectiveMenu();
    }
    function objectiveMenu() {
        var container = new PIXI.Sprite(PIXI.loader.resources['pics/menuBackground.png'].texture);
    
        var objective = new PIXI.Text("Objective:", headerStyle);
        objective.x = (container.width - objective.width) / 2;
        container.addChild(objective);
    
        var objective1 = new PIXI.Text("As a team member, you are our organization's first line of defense in a malicious attack! Fly through cyber space and block malicious attackers from stealing our company data.", objectiveStyle);
        var objective2 = new PIXI.Text("Top score winner will receive a Nintendo Entertainment System: NES Classic Edition!", objectiveStyle);
        objective1.y = ((container.height - (objective1.height + objective2.height)) / 2) - 50;
        objective1.x = objective2.x = 200;
        objective2.y = objective1.y + objective1.height + 40;
        container.addChild(objective1);
        container.addChild(objective2);
    
        var next = new PIXI.Sprite(PIXI.loader.resources['pics/nextButton.png'].texture);
        next.x = (container.width - next.width) / 2;
        next.y = container.height - next.height;
        next.buttonMode = true;
        next.interactive = true;
        next.on('mouseup', controlMenuHelper);
        container.addChild(next);
    
        container.x = (app.stage.width - container.width) / 2;
        container.y = 50;
        app.stage.addChild(container);
    }
    //FIXME: consider consolidating all of these menu helper functions into one
    function controlMenuHelper() {
        removeStageChildren(1);
        controlsMenu();
    }
    function controlsMenu() {
        var container = new PIXI.Sprite( PIXI.loader.resources['pics/menuBackground.png'].texture);
        
        var instructionHeader = new PIXI.Text("Controls:", headerStyle);
        instructionHeader.x = (container.width - instructionHeader.width) / 2;
        container.addChild(instructionHeader);
        
        var fire = new PIXI.Text("Fire", textStyle);
        fire.x = 295;
        fire.y = instructionHeader.y + instructionHeader.height + 15;
        container.addChild(fire);
    
        var left = new PIXI.Text("Move Left", textStyle);
        left.x = 515;
        left.y = instructionHeader.y + instructionHeader.height + 15;
        container.addChild(left);
    
        var right = new PIXI.Text("Move Right", textStyle);
        right.x = 650;
        right.y = instructionHeader.y + instructionHeader.height + 15;
        container.addChild(right);
    
        var controls = new PIXI.Sprite(PIXI.loader.resources['pics/controls.png'].texture);
        controls.height = 100;
        controls.width = 599;
        controls.y = fire.y + fire.height + 15;
        controls.x = (container.width - controls.width) / 2;
        container.addChild(controls);
    
        var scoring = new PIXI.Text("Scoring:", headerStyle);
        scoring.x = (container.width - scoring.width) / 2;
        scoring.y = controls.y + controls.height + 30;
        container.addChild(scoring);
    
        var scoringRules = new PIXI.Text("Each completed round gives you 20 points. Each enemy that you hit gives you 25 points. Each failed round subtracts all of the points you gained from that round and an additional 40 points. Each shot that you fire subtracts 1 point.", textStyle);
        scoringRules.x = 150;
        scoringRules.y = scoring.y + scoring.height + 15;
        container.addChild(scoringRules);
    
        var startButton = new PIXI.Sprite(PIXI.loader.resources['pics/nextButton.png'].texture);
        startButton.y = container.height - 100;
        startButton.x = (container.width - startButton.width) / 2;
        startButton.buttonMode = true;
        startButton.interactive = true;
        startButton.on('mouseup', roundMenuHelper);
        container.addChild(startButton);
        
        container.x = (app.stage.width - container.width) / 2;
        container.y = 50;
        app.stage.addChild(container);
    }
    function roundMenuHelper() {
        removeStageChildren(1);
        roundMenu();
        if (userwon) {
            score += 20; 
            if (roundNumber > 1 && roundNumber - 1 < enemyTypeList.length) {
                app.stage.children[1].text = "SCORE: " + (score + roundScore);
            }
        } else {
            // Due to limitations with scoreboard
            if (0 < lives && lives < 3) {
                score -= 40;
                app.stage.children[1].text = "SCORE: " + (score + roundScore);
            }
        }
    }
    function roundMenu() {
        if (lives === 0 || roundNumber - 1 === enemyTypeList.length) {
            if (roundNumber - 1 === enemyTypeList.length) {
                score += 20;
            }
            scoreMenu();
        } else {
            displayScore();
            initializeLifeCounter();
    
            var enemy = enemyTypeList[roundNumber - 1];
            var container = new PIXI.Sprite( PIXI.loader.resources['pics/menuBackground.png'].texture);
    
            var round = new PIXI.Text("ROUND " + roundNumber, titleStyle);
            round.x = (container.width - round.width) / 2;
            round.y = 0;
            container.addChild(round);
    
            var nextCharacter = new PIXI.Text(enemy.name, headerStyle);
            nextCharacter.x = (container.width - nextCharacter.width) / 2;
            nextCharacter.y = round.y + round.height + 30;
            container.addChild(nextCharacter);
    
            var characterInfo = new PIXI.Text(enemy.description, textStyle);
            characterInfo.x = 150;
            characterInfo.y = nextCharacter.y + nextCharacter.height + 20;
            container.addChild(characterInfo);
    
            var mitigation = new PIXI.Text(enemy.mitigation, textStyle);
            mitigation.x = 150;
            mitigation.y = characterInfo.y + characterInfo.height + 40;
            container.addChild(mitigation);
    
            var startButton = new PIXI.Sprite(PIXI.loader.resources['pics/startButton.png'].texture);
            startButton.y = container.height - 100;
            startButton.x = (container.width - startButton.width) / 2;
            startButton.buttonMode = true;
            startButton.interactive = true;
            startButton.on('mouseup', startRound);
            container.addChild(startButton);
    
            container.x = (app.stage.width - container.width) / 2;
            container.y = 50;
            app.stage.addChild(container);
        }
    }
    function displayScore() {
        var currScore = score;
        var scoreCounter = new PIXI.Text("SCORE: " + currScore, textStyle);
        app.stage.addChild(scoreCounter);
    }
    function startRound() {
        removeStageChildren(2);
        // var tempScore = new PIXI.Text("SCORE: " + score, textStyle);
        // app.stage.addChild(tempScore);
        setup();
        state = play;
    }
    function quizMenu() {
        var container = new PIXI.Sprite( PIXI.loader.resources['pics/menuBackground.png'].texture);

        var question = new PIXI.Text(enemyTypeList[roundNumber - 2].quiz.question, objectiveStyle);
        question.x = (container.width - question.width) / 2;
        question.y = 0;
        container.addChild(question);

        var header = new PIXI.Text("Click on the answer you think is correct. If your answer is correct you will be awarded an additional 60 points.", quizInstructionsStyle);
        header.x = (container.width - header.width) / 2;
        header.y = question.y + question.height + 20;
        container.addChild(header);

        for (var i = 0; i < enemyTypeList[roundNumber - 2].quiz.answers.length; i++) {
            var tempAnswer = new PIXI.Text(enemyTypeList[roundNumber - 2].quiz.answers[i], textStyle);
            tempAnswer.x = (container.width - tempAnswer.width) / 2;
            var lastChild = container.children[container.children.length - 1];
            tempAnswer.y = lastChild.y + lastChild.height + 30;
            tempAnswer.buttonMode = true;
            tempAnswer. interactive = true;
            var boundFunc = checkAnswer.bind(this);
            tempAnswer.on('mouseup', boundFunc);
            container.addChild(tempAnswer);
        }
        
        container.x = (app.stage.width - container.width) / 2;
        container.y = 50;
        app.stage.addChild(container);
    }
    function quizMenuHelper() {
        removeStageChildren(2);
        quizMenu(); 
    }
    function checkAnswer(obj) {
        var container = new PIXI.Sprite(PIXI.loader.resources['pics/menuBackground.png'].texture);

        var question = new PIXI.Text(enemyTypeList[roundNumber - 2].quiz.question, objectiveStyle);
        question.x = (container.width - question.width) / 2;
        question.y = 0;
        container.addChild(question);
        
        var userAnswer = new PIXI.Text("You answered: " + obj.currentTarget._text, textStyle);
        userAnswer.x = (container.width - userAnswer.width) / 2;
        userAnswer.y = question.y + question.height + 20;
        container.addChild(userAnswer);

        if (obj.currentTarget._text === enemyTypeList[roundNumber - 2].quiz.correctAnswer) {
            score += 60;
            app.stage.children[1].text = "SCORE: " + (score + roundScore);
            var userCorrect = new PIXI.Text("This is correct! You have been awarded and additional 60 points!", textStyle);
            userCorrect.x = (container.width - userCorrect.width) / 2;
            userCorrect.y = userAnswer.y + userAnswer.height + 20;
            container.addChild(userCorrect);

        } else {
            var userCorrect = new PIXI.Text("This is incorrect", textStyle);
            userCorrect.x = (container.width - userCorrect.width) / 2;
            userCorrect.y = userAnswer.y + userAnswer.height + 20;
            container.addChild(userCorrect);

            var correctAns = new PIXI.Text("Correct answer: " + enemyTypeList[roundNumber - 2].quiz.correctAnswer, textStyle);
            correctAns.x = (container.width - correctAns.width) / 2;
            correctAns.y = userCorrect.y + userCorrect.height + 20;
            container.addChild(correctAns);
        }

        var afterQ = new PIXI.Text(enemyTypeList[roundNumber - 2].quiz.afterQuiz, quizInstructionsStyle);
        if (correctAns) {
            afterQ.y = correctAns.y + correctAns.height + 20;
        } else {
            afterQ.y = userCorrect.y + userCorrect.height + 20;

        }
        afterQ.x = (container.width - afterQ.width) / 2;
        container.addChild(afterQ);

        var nextButton = new PIXI.Sprite(PIXI.loader.resources['pics/nextButton.png'].texture);
        nextButton.y = container.height - 100;
        nextButton.x = (container.width - nextButton.width) / 2;
        nextButton.buttonMode = true;
        nextButton.interactive = true;
        nextButton.on('mouseup', roundMenuHelper);
        container.addChild(nextButton);

        container.x = (app.stage.width - container.width) / 2;
        container.y = 50;
        app.stage.addChild(container);

    }
    
    function scoreMenu() {
        //Removes canvas from stage
        app.destroy(true);
    
        document.querySelector(".game-container").classList.add("display-none");
        //Creates elements for the menu
        var pageContainer = document.createElement("div");
        pageContainer.classList.add("page-container");
        var container = document.createElement("div");
        container.classList.add("score-menu");
    
        container.innerHTML += "<div class='text header'>Score: " + score + "</div>";
    
        var formContainer = document.createElement("div");
        formContainer.classList.add("form");
        formContainer.innerHTML += "<div class='status-container hide'></div>";
        formContainer.innerHTML += "<div class='text label'>Name:</div><input type='text' id='name' class='score-input form-input'>";
    
        container.appendChild(formContainer);
    
        container.innerHTML += "<div class='button button-text' onclick='submitScore()'>SUBMIT SCORE</div>";
        pageContainer.appendChild(container);
    
        document.body.appendChild(pageContainer);
    }
    //END MENUS AND ASSOCIATED FUNCTIONS

    //submits score to scoreboard
    function submitScore() {
        var scoreInfo = getScoreInfo();
        if (scoreInfo) {
            var xhttp = new XMLHttpRequest();
    
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState === 4 && xhttp.status === 200) {
                    //CLEAR MENU & ALERT IT WAS SUCCESSFUL. -> play again button
                    getScoreboard();
                    //ddSuccessNotification();
                    // TODO: add submission confirmation to scoreboard.
                } else if (xhttp.readyState === 4 && xhttp.status !== 200) {
                    //addErrorNotification(); // TODO: add error notification to scoreboard.
                    //TODO: change error handling
                }
            };
    
            xhttp.open("POST", "https://liammahoney.me/cyber-space/score", true);
            xhttp.send(JSON.stringify(scoreInfo));
        }
    }
    function displayScores(scores) {
        //TODO:
        let scoreMenu = document.querySelector(".score-menu");
        let scoreboard = `<div class="title">HIGH SCORES</div><div class="scoreboard">`;
        for (let i = 0; i < scores.length; i++) {
            let row = `<div class="score-row"><div class="score-item">${i + 1}</div><div class="score-item">${scores[i].score}</div><div class="score-item">${scores[i].name}</div></div>`;
            scoreboard += row;
        }
        scoreboard += `</div>`;
        scoreMenu.innerHTML = scoreboard;
        scoreMenu.innerHTML += "<div class='button button-text' onclick='playAgain()'>PLAY AGAIN</div>";
    }
    // Gets scores from backend API
    function getScoreboard() {
        let xhttp = new XMLHttpRequest();
    
        xhttp.onreadystatechange = () => {
            if (xhttp.readyState === xhttp.DONE && xhttp.status === 200) {
                displayScores(JSON.parse(xhttp.responseText));
            } else if (xhttp.readystate === xhttp.DONE && xhttp.status !== 200) {
                postError(xhttp.responseText);
            }
        };
        
        xhttp.open("GET", "https://liammahoney.me/cyber-space/score", true);
        xhttp.send(null);
    }
    
    function getScoreInfo() {
        var filledOut = checkUserInput();
        if (filledOut) {
            var list = document.querySelectorAll('.score-input');
            var scoreInfo = {};
    
            for (var x = 0; x < list.length; x++) {
                scoreInfo[list[x].id] = list[x].value;
            }
            scoreInfo["score"] = score;
            return scoreInfo;
        } else {
            return false;
        }
    }
    function checkUserInput() {
        var inputList = document.querySelectorAll('.score-input');
        var status = true;
        for (var x = 0; x < inputList.length; x++) {
            if (inputList[x].value === "" || inputList[x].value === "...") {
                inputList[x].classList.add('required');
                if (inputList[x].id === "segment") {
                    inputList[x].setAttribute('onchange', 'checkUserInput()');
                } else {
                    inputList[x].setAttribute('onkeyup', 'checkUserInput()');
                }
                status = false;
            } else {
                if (inputList[x].classList.contains('required')) {
                    inputList[x].classList.remove('required');
                }
            }
        }
        return status;
    }
    function clearScoreMenu() {
        var scoreboardList = document.querySelectorAll('.score-input');
        for (var x = 0; x < scoreboardList.length; x++) {
            if (scoreboardList[x].id === "segment") {
                scoreboardList[x].value = "...";
            } else {
                scoreboardList[x].value = "";
            }
        }
    }
    function changeScoreButton() {
        var button = document.querySelector('.button');
        button.innerHTML = "PLAY AGAIN";
        button.setAttribute('onclick', 'playAgain()');
    
    }
    function addSuccessNotification() {
        var container = document.querySelector('.status-container');
        container.innerHTML += "<div class='success-notification-container'><div class='notification-text'>Score Successfully Submitted!</div></div>";
        container.classList.remove('hide');
    }
    function addErrorNotification() {
        var container = document.querySelector('.status-container');
        container.innerHTML += "<div class='error-notification-container'><div class='notification-text'>There has been an error. \n This issue and your score have been reported.</div></div>";
        container.classList.remove('hide');
    }
    function playAgain() {
        location.reload();
    }
    function postError(error) {
        var xhttp = new XMLHttpRequest();
        var message = buildErrorMessage(JSON.parse(error));
    
        var payload = {"text": message};
        
     //TODO: need to remake error handling
        xhttp.open("POST", "", true);
        xhttp.send(JSON.stringify(payload));
    }
    function buildErrorMessage(error) {
        var userInputList = document.querySelectorAll('.score-input');
        var message = "**ERROR:** " + error + "\n";
        for (var x = 0; x < userInputList.length; x++) {
            var temp = "**" + userInputList[x].id.toUpperCase() + ":** " + userInputList[x].value + "\n";
            message += temp;
        }
    
        message += "**SCORE:** " + score;
    
        return message;
    }
    //Removes all sprites from the app stage
    //i: number of sprites we want to remain in the stage
    function removeStageChildren(i) {
    
        while (app.stage.children.length > i) {
            app.stage.removeChild(app.stage.children[i]);
        }
        enemyList = [];
        enemyAmmoList = [];
        userAmmoList = [];
    }
    function keyboardListener() {
          //Capture the keyboard arrow keys
        let left = keyboard(37);
        let right = keyboard(39);
        let spacebar = keyboard(32);
      
        //Left arrow key `press` method
        left.press = function()  {
          //Change the user's velocity when the key is pressed
          user.vx = -7;
        };
        
        //Left arrow key `release` method
        left.release = function()  {
          //If the left arrow has been released, and the right arrow isn't down,
          //and the user isn't moving vertically:
          //Stop the user
          if (!right.isDown) {
            user.vx = 0;
          }
        };
      
        //Right
        right.press = function()  {
          user.vx = 7;
        };
        right.release = function()  {
          if (!left.isDown) {
            user.vx = 0;
          }
        };  
        
        spacebar.press = function()  {
            // if (user.alive) {
              roundScore = roundScore - 1;
              var newAmmo = new PIXI.Sprite(PIXI.loader.resources['pics/ammo.png'].texture);
              newAmmo.position.set(user.x + 20, user.y);
            //   console.log('user fired');
              app.stage.addChild(newAmmo);
              userAmmoList.push(newAmmo);
            // }
        };
    }
    /* taken from PIXI tutorial: https://github.com/kittykatattack/learningPixi */
    function keyboard(keyCode) {
        var key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = function (event) {
            if (lives > 0 && roundNumber <= enemyTypeList.length) {
                if (event.keyCode === key.code) {
                    if (key.isUp && key.press) key.press();
                    key.isDown = true;
                    key.isUp = false;
                }
                event.preventDefault();
            }
        };
      
        //The `upHandler`
        key.upHandler = function (event) {
            if (lives > 0 && roundNumber <= enemyTypeList.length) {
                if (event.keyCode === key.code) {
                    if (key.isDown && key.release) key.release();
                    key.isDown = false;
                    key.isUp = true;
                }
                event.preventDefault();
            }
        };
      
        //Attach event listeners
        window.addEventListener(
          "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
          "keyup", key.upHandler.bind(key), false
        );
    
        return key;
      }
    
      function hitTest(ammo) {
          for (var i = 0; i < enemyList.length; i++) {
              if (hitTestHelper(ammo, enemyList[i])) {
                  //REMOVE ENEMY and AMMO
                  app.stage.removeChild(ammo);
                  app.stage.removeChild(enemyList[i]);
                  enemyList.splice(i, 1);
                  return true;
              } 
          }
          return false;
      }
      
      /*Taken from PIXIjs tutorial: https://github.com/kittykatattack/learningPixi */
      function hitTestHelper(r1, r2) {
    
        //Define the variables we'll need to calculate
        var hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
      
        //hit will determine whether there's a collision
        hit = false;
      
        //Find the center points of each sprite
        r1.centerX = r1.x + r1.width / 2;
        r1.centerY = r1.y + r1.height / 2;
        r2.centerX = r2.x + r2.width / 2;
        r2.centerY = r2.y + r2.height / 2;
      
        //Find the half-widths and half-heights of each sprite
        r1.halfWidth = r1.width / 2;
        r1.halfHeight = r1.height / 2;
        r2.halfWidth = r2.width / 2;
        r2.halfHeight = r2.height / 2;
      
        //Calculate the distance vector between the sprites
        vx = r1.centerX - r2.centerX;
        vy = r1.centerY - r2.centerY;
      
        //Figure out the combined half-widths and half-heights
        combinedHalfWidths = r1.halfWidth + r2.halfWidth;
        combinedHalfHeights = r1.halfHeight + r2.halfHeight;
      
        //Check for a collision on the x axis
        if (Math.abs(vx) < combinedHalfWidths) {
      
          //A collision might be occurring. Check for a collision on the y axis
          if (Math.abs(vy) < combinedHalfHeights) {
      
            //There's definitely a collision happening
            hit = true;
          } else {
      
            //There's no collision on the y axis
            hit = false;
          }
        } else {
      
          //There's no collision on the x axis
          hit = false;
        }
      
        //`hit` will be either `true` or `false`
        return hit;
      };
    }
 }
