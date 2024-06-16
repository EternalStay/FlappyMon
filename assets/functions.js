function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

function loadMask(src) {
    return new Promise((resolve, reject) => {
        fetch(src)
        .then(response => {
            return response.json();
        })
        .then(data => {
            resolve(data);
        })
    });
}

function loadSound(src) {
    const audio = new Audio();
    audio.src = src;
    return audio;
}

function displayStartMessage() {
    const text = 'Appuie sur Espace pour démarrer le jeu';
    ctx.font = '20px Arial';

    const textWidth = ctx.measureText(text).width;
    const textHeight = 20;
    const x = canvas.width / 2 - textWidth / 2;
    const y = canvas.height / 2 - textHeight / 2;
    const rectWidth = textWidth + 40;
    const rectHeight = textHeight + 40;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(x - 20, y - 20, rectWidth, rectHeight - 10);
    ctx.fillStyle = '#FFF';
    ctx.fillText(text, x, y + textHeight / 2);
}

function displayGameOverPanel() {
    let findNewScore = false;

    if ((highScores.length < 5) || (highScores.length > 0 && highScores[highScores.length - 1] <= score)) {
        let newHighScores = [];
        for (i = 0; i < 5; i++) {
            if ((highScores.length <= i || score >= highScores[i]) && !findNewScore) {
                newHighScores.push(score);
                findNewScore = true;
            } else if (!findNewScore && highScores.length >= i) {
                newHighScores.push(highScores[i]);
            } else if (findNewScore && highScores.length >= i) {
                newHighScores.push(highScores[newHighScores.length - 1]);
            }
        }
        highScores = newHighScores;
    }

    const rectWidth = canvas.width * 0.8;
    const rectHeight = canvas.height * 0.5;
    const x = (canvas.width - rectWidth) / 2;
    const y = (canvas.height - rectHeight) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x, y, rectWidth, rectHeight);

    ctx.fillStyle = '#FFF'; // Couleur du texte
    ctx.font = '30px Arial';
    const textPadding = 20;

    const scoreText = 'Classement';
    const scoreTextWidth = ctx.measureText(scoreText).width;
    ctx.fillText(scoreText, canvas.width / 2 - scoreTextWidth / 2, y + textPadding + 30);

    ctx.font = '20px Arial';
    let findScore = 0;
    for (let i = 0; i < 5; i++) {
        if (highScores.length >= i && score == highScores[i] && findScore == 0) {
            findScore++;
        }
        const highScoreText = (findScore == 1 ? '====> ' : '') + '#' + (i + 1) + ' : ' + (i < highScores.length ? highScores[i] : '-') + (findScore == 1 ? ' <====' : '');
        const highScoreTextWidth = ctx.measureText(highScoreText).width;
        ctx.fillText(highScoreText, canvas.width / 2 - highScoreTextWidth / 2, y + textPadding + 80 + i * 30);
        if (findScore == 1) {
            findScore++;
        }
    }
    if (findScore == 0) {
        const highScoreText = '====> Score : ' + score + ' <====';
        ctx.fillText(highScoreText, canvas.width / 2 -  ctx.measureText(highScoreText).width / 2, y + textPadding + 80 + 5.5 * 30);
    } else {
        const highScoreText = 'Nouveau score !';
        ctx.fillText(highScoreText, canvas.width / 2 -  ctx.measureText(highScoreText).width / 2, y + textPadding + 80 + 5.5 * 30);
    }
}

// Simule le battement d'ailes de Flappy
function changeFlappy() {
    currentFlappyIndex++;
    if (currentFlappyIndex >= flappySprites.length) {
        currentFlappyIndex = 0;
    }

    flappyImg.src = pokemonPath + pokemonSelect + '/' + flappySprites[currentFlappyIndex];
}

// Fait monter Flappy dans les airs
function moveUp() {
    changeFlappy();
    sounds.fly.play();

    velocity = lift;
    gravity = reducedGravity;
}

// Génération des prochains tuyaux
function generatePipes() {
    let pipeX = canvas.width;
    nextPipes.push({
        x: pipeX,
        y: Math.floor(Math.random() * pipeTopImg.height) - pipeTopImg.height
    });
    pipeX += 220;
}

// Met à jour la position des tuyaux
function updatePipes() {
    if (!paused) {
        for (let i = 0; i < nextPipes.length; i++) {
            // Déplacement de la map
            nextPipes[i].x--;
            if (nextPipes[i].x === bX + flappyImg.width) {
                score++;
                sounds.score.play();
            }

            // Vérification des collisions avec les tuyaux
            if (
                (bX + flappyImg.width >= nextPipes[i].x && bX <= nextPipes[i].x + pipeTopImg.width) // Vérifie si Flappy traverse un tuyau horizontalement
                && ((bY <= nextPipes[i].y + pipeTopImg.height) || (bY + flappyImg.height >= nextPipes[i].y + constant)) // Vérifie si Flappu verticalement
            ) {
                if (checkCollisions(bX, bY, flappyImg, nextPipes[i], constant)) {
                    sounds.collision.play();
                    gameOverMenu();
                }
            }

            // Vérification des collisions avec le sol
            if (bY + flappyImg.height >= canvas.height) {
                sounds.collision.play();
                gameOverMenu();
            }
        }

        // Génération d'autres tuyaux
        if (nextPipes[nextPipes.length - 1].x < canvas.width / 2) {
            generatePipes();
        }   
    }
}

// Vérification si collision entre Flappy et les tuyaux
function checkCollisions(bX, bY, flappyImg, nextPipes, constant) {
    let result = false;

    for (x = bX; x < bX + flappyImg.width && !result; x++) {
        for (y = bY; y < bY + flappyImg.width && !result; y++) {
            let posX = x - bX;
            let posY = Math.ceil(y - bY);
            if ((x >= nextPipes.x && x <= nextPipes.x + pipeTopImg.width) && (y <= nextPipes.y + pipeTopImg.height || y >= nextPipes.y + constant)) {
                if (flappyMasks[currentFlappyIndex][posY][posX] == 1) {
                    console.log('Touché en (' + posX + ',' + posY + '), sur l\'image n°' + currentFlappyIndex);
                    result = true;
                }
            }
        }
    }

    return result;
}

// Lancement de la page
function init() {
    newGame();
}

// Création d'une nouvelle partie
function newGame() {
    gameLaunch = false;
    gameOver = false;
    paused = false;

    flappyImg.src = pokemonPath + pokemonSelect + '/' + flappySprites[0];

    bX = 10;
    bY = canvas.height / 2 - flappyImg.height;

    gap = 150;
    constant = pipeTopImg.height + gap;

    gravity = initialGravity;
    lift = -3;
    velocity = 0;

    score = 0;

    nextPipes = [];
    generatePipes();

    ctx.drawImage(backgroundImg, 0, -200);
    ctx.drawImage(flappyImg, bX, bY);
    
    displayStartMessage();
}

// Fin du jeu
function gameOverMenu() {
    gameOver = true;
    sounds.death.play();

    // TODO : Ajouter écran de fin avec score / classement
    displayGameOverPanel();

    setTimeout(() => {
        newGame();
    }, 5000);
}

// Dessine les éléments
function draw() {
    if (gameLaunch && !paused) {
        if (!gameOver) {
            ctx.drawImage(backgroundImg, 0, -200);

            for (let i = 0; i < nextPipes.length; i++) {
                constant = pipeTopImg.height + gap;
                ctx.drawImage(pipeTopImg, nextPipes[i].x, nextPipes[i].y);
                ctx.drawImage(pipeBotImg, nextPipes[i].x, nextPipes[i].y + constant);
            }

            ctx.drawImage(flappyImg, bX, bY);

            velocity += gravity;
            bY += velocity;
            if (gravity < initialGravity) {
                gravity += gravityIncreaseRate;
            }
            if (bY < 0) {
                bY = 0;
                velocity = 0;
            }

            ctx.fillStyle = '#000';
            ctx.font = '20px Arial';
            ctx.fillText('Score : ' + score, 10, canvas.height - 20);

            updatePipes();
        }

        animationFrameId = requestAnimationFrame(draw);
    }
}



/* Gestion des évènements */

// Jeu PC
document.addEventListener('keydown', keyPressed);
canvas.addEventListener('click', screenTouched);
canvas.addEventListener('touchstart', screenTouched);

// Jeu mobile ou PC

function keyPressed(event) {
    if (!gameLaunch) {
        if (event.key === ' ') {
            gameLaunch = true;
            sounds.start.play();
            moveUp();
            requestAnimationFrame(draw);
        }
    } else {
        if (event.key === 'Escape') {
            paused = !paused;
            if (paused) {
                cancelAnimationFrame(animationFrameId);
            } else {
                requestAnimationFrame(draw);
            }
        } else if (!paused && !gameOver && event.key === ' ') {
            moveUp();
        }
    }
}

function screenTouched(event) {
    event.preventDefault();

    if (!gameLaunch) {
        gameLaunch = true;
        sounds.start.play();
        moveUp();
        requestAnimationFrame(draw);
    } else {
        if (paused) {
            paused = !paused;
            requestAnimationFrame(draw);
        } else if (!paused && !gameOver) {
            moveUp();
        }
    }
}