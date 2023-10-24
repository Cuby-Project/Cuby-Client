const buttonGenerate = document.querySelector('#regenerate');
const buttonDisplayScramble = document.querySelector("#displayScramble");
const scramble = document.querySelector('#scramble');
const selectCube = document.querySelector('#selectCube');

// previews items
const previewContainer = document.querySelector('#previewContainer');
const previewScramble = document.querySelector("#previewScramble");
const previewIcon = document.querySelector("#previewIcon");

const cubes = {
    "2x2": "2x2x2",
    "3x3": "3x3x3",
    "4x4": "4x4x4",
    "5x5": "5x5x5",
    "6x6": "6x6x6",
    "7x7": "7x7x7",
    "square-one": "square1",
    "pyraminx": "pyraminx",
    "skewb": "skewb",
    "megaminx": "megaminx"
}

function refreshScramble() {
    // if the preview is displayed, we hide it
    if (!previewContainer.classList.contains("hidden")) {
        changeDisplay();
    }
    api.generateScramble()
        .then(data => {
            scramble.innerHTML = data;
        });
    // displayPreview()
}

function generatePreview(puzzle, alg) {
    let preview = "<twisty-player class='h-44 w-[15rem]'";
    preview += "alg=\"" + alg + "\" puzzle='";
    preview += puzzle + "' hint-facelets='none' back-view='none' control-panel='none' background='none' ></twisty-player>";
    return preview;
}

function changeDisplay() {
    if (previewIcon.classList.contains("fa-eye")) {
        previewContainer.classList.remove("hidden");
        previewIcon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        previewContainer.classList.add("hidden");
        previewIcon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

function displayPreview() {
    let alg = scramble.innerHTML;
    let puzzle = selectCube.value ;
    previewScramble.innerHTML = generatePreview(cubes[puzzle], alg);
    changeDisplay();
}

buttonGenerate.addEventListener('click', refreshScramble)
refreshScramble();

buttonDisplayScramble.addEventListener('click', displayPreview)
selectCube.addEventListener("change", displayPreview)

let isRunning = false;
let time = 0;
let timerInterval;

const timerDisplay = document.getElementById("timer");

let espaceEnfonce = false;
let tempsDebut;
let startAppelee = false;

document.addEventListener('keydown', (event) => {
    if (event.key === ' ' && !espaceEnfonce) {
        // Lorsque la barre d'espace est enfoncée pour la première fois, démarrez le chronomètre
        tempsDebut = Date.now();
        espaceEnfonce = true;
        startAppelee = false; // Réinitialisez la variable startAppelee

        // Si le chronomètre est déjà en cours, arrêtez-le
        if (isRunning) {
            stop();
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === ' ' && espaceEnfonce) {
        // Lorsque la barre d'espace est relâchée, vérifiez la durée
        const tempsMaintenu = Date.now() - tempsDebut;

        if (tempsMaintenu >= 1000) {
            if (!startAppelee) {
                // Si la barre d'espace a été maintenue enfoncée pendant au moins une seconde et start n'a pas été appelée, appelez la fonction start
                start();
                startAppelee = true;
            }
        } else {
            if (startAppelee) {
                // Si la barre d'espace est relâchée après que start ait été appelée, appelez la fonction stop
                stop();
            }
        }

        // Réinitialisez les variables
        espaceEnfonce = false;
        tempsDebut = 0;
    }
});

function start() {
    isRunning = true;
    time = 0; // Réinitialisez le temps à zéro
    timerDisplay.classList.remove("text-green-500");
    timerDisplay.classList.remove("text-white");
    timerDisplay.classList.add("text-red-500");
    timerDisplay.innerHTML = "00:00:00"; // Réinitialisez l'affichage
    timerInterval = setInterval(updateTimer, 10);
}

function stop() {
    clearInterval(timerInterval);
    isRunning = false;
    timerDisplay.classList.remove("text-red-500");
    timerDisplay.classList.remove("text-green-500");
    timerDisplay.classList.add("text-white");
}

function updateTimer() {
    time++;
    // we display the time in this format : 00:00:00
    let minutes = Math.floor(time / 100 / 60);
    let seconds = Math.floor(time / 100);
    let milliseconds = time % 100;

    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    if (seconds >= 60) {
        seconds = seconds % 60;
    }

    if (seconds < 10) {
        seconds = "0" + seconds;
    }

    if (milliseconds < 10) {
        milliseconds = "0" + milliseconds;
    }

    timerDisplay.innerHTML = minutes + ":" + seconds + ":" + milliseconds;
}