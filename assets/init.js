const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');



/* Chargement des assets */

const assetsPath = 'assets/';
const soundPath = assetsPath + 'sounds/';
const imgPath = assetsPath + 'images/';
const pokemonPath = imgPath + 'pokemon/';
const pokemonMaskPath = assetsPath + 'masks/';

const sounds = {
    start: loadSound(soundPath + 'start.wav'),
    fly: loadSound(soundPath + 'fly.wav'),
    score: loadSound(soundPath + 'score.wav'),
    collision: loadSound(soundPath + 'collision.wav'),
    death: loadSound(soundPath + 'death.wav'),
};

let pokemonSelect = 'piafabec';
const flappySprites = ['0.png', '1.png'];
const flappyImg = loadImage(pokemonPath + pokemonSelect + '/0.png');
const backgroundImg = loadImage(imgPath + '/background.jpg');
const pipeTopImg = loadImage(imgPath + '/pipe/top.png');
const pipeBotImg = loadImage(imgPath + '/pipe/bot.png');

const flappyMasks = [
    loadMask(pokemonMaskPath + pokemonSelect + '/0.json'), 
    loadMask(pokemonMaskPath + pokemonSelect + '/1.json'), 
];


/* Initialisation des variables */

let animationFrameId;
let currentFlappyIndex = 0;
let gameLaunch = false;
let gameOver = false;
let paused = false;

// Points
let score = 0;
let coins = 0;

// Position initiale de Flappy
let bX = 10;
let bY = canvas.height / 2 - flappyImg.height;

// Gestion des tuyaux
let nextPipes = [];
let gap = flappyImg.height * 3;
let constant = pipeTopImg.height + gap;

// Gestion de la gravité
const initialGravity = 0.1;
const reducedGravity = 0.005;
const gravityIncreaseRate = 0.005;
let gravity = initialGravity;
let lift = -3;
let velocity = 0;



/* Lancement du jeu */
Promise.all(flappyMasks).then(() => { init(); });