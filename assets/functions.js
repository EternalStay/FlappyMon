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
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.fillText('Appuie sur Espace pour démarrer le jeu', canvas.width / 2 - 175, canvas.height / 2);
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
            if ((bX + flappyImg.width >= nextPipes[i].x && bX <= nextPipes[i].x + pipeTopImg.width) && ((bY <= nextPipes[i].y + pipeTopImg.height) || (bY + flappyImg.height >= nextPipes[i].y + constant))) {
                sounds.collision.play();
                gameOverMenu();
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

    setTimeout(() => {
        newGame();
    }, 2000);
}

// Dessine les éléments
function draw() {
    if (gameLaunch && !paused && !gameOver) {
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
        animationFrameId = requestAnimationFrame(draw);
    }
}



/* Gestion des évènements */

document.addEventListener('keydown', keyPressed);

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
        } else if (!paused && event.key === ' ') {
            moveUp();
        }
    }
}

