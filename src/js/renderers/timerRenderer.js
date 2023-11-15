const buttonGenerate = document.querySelector('#regenerate');
const buttonDisplayScramble = document.querySelector("#displayScramble");
const scramble = document.querySelector('#scramble');
const selectCube = document.querySelector('#selectCube');

// previews items
const previewContainer = document.querySelector('#previewContainer');
const previewScramble = document.querySelector("#previewScramble");
const previewIcon = document.querySelector("#previewIcon");

// tumer items
const timerDisplay = document.getElementById("timer");


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
}

function getScramble() {
    return scramble.innerHTML;
}

function generatePreview(puzzle, alg) {
    let preview = "<twisty-player class='h-44 w-[15rem]'";
    preview += "alg=\"" + alg + "\" puzzle='";
    preview += puzzle + "' hint-facelets='none' back-view='none' control-panel='none' background='none' ></twisty-player>";
    return preview;
}


function displayPreview() {
    let alg = scramble.innerHTML;
    let puzzle = selectCube.value;
    previewScramble.innerHTML = generatePreview(cubes[puzzle], alg);
}

buttonGenerate.addEventListener('click', refreshScramble)
refreshScramble();

buttonDisplayScramble.addEventListener('click', displayPreview)
selectCube.addEventListener("change", displayPreview)


let time = 0;
let timerInterval;
let startTime;
let spacePressed = false;
let isRunning = false;
let startCalled = false;
let releasedTooEarly = false;
let timerStart;

function colorWaiter() {
    timerDisplay.classList.add("text-red-500");
    setTimeout(() => {
        timerDisplay.classList.remove("text-red-500");
        if (!releasedTooEarly) {
            timerDisplay.classList.add("text-green-500");
        } else {
            releasedTooEarly = false;
        }
    }, 1000);
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ' && !spacePressed) {
        // When the space bar is pressed for the first time, start the timer
        startTime = Date.now();
        spacePressed = true;
        startCalled = false; // Reset the startCalled variable
        releasedTooEarly = false;
        // If the timer is already running, stop it
        if (isRunning) {
            stop();
        } else {
            colorWaiter();
        }
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === ' ' && spacePressed) {
        // When the space bar is released, check the duration
        const timeHeld = Date.now() - startTime;

        if (timeHeld >= 1000) {
            if (!startCalled) {
                // If the space bar was held for at least one second and start hasn't been called, call the start function
                start();
                timerDisplay.classList.remove("text-green-500");
                timerDisplay.classList.remove("text-red-500");
                startCalled = true;
            }
        } else {
            releasedTooEarly = true;
            startCalled = false;
            if (startCalled) {
                // If the space bar is released after start has been called, call the stop function
                stop();
                refreshStatistics();
            }
        }

        // Reset the variables
        spacePressed = false;
        startTime = 0;
    }
});

function start() {
    isRunning = true;
    timerDisplay.innerHTML = "00:00,00"; // Reset the display
    timerStart = timeAPI.now();
    timerInterval = setInterval(updateTimer, 10);
}

function updateTimer() {
    timerDisplay.innerHTML = timeAPI.formatDuration(timeAPI.getDuration(timerStart));
}


function stop() {
    clearInterval(timerInterval);
    isRunning = false;
    refreshScramble(); // when we stop the timer, a new scramble is proposed

    time = timeAPI.getDuration(timerStart);
    timeAPI.registerTime(time, cubes[selectCube.value], getScramble());
    refreshStatistics();
}

// statistics at the bottom of the page :

function displayAverage() {
    solvesDataAPI.getAverage(cubes[selectCube.value])
        .then(data => {
            if (isNaN(data) || data === 0) {
                document.querySelector("#average").innerHTML = "No solve yet";
                return;
            }
            document.querySelector("#average").innerHTML = timeAPI.formatDuration(data);
        });
}

function displayBest() {
    solvesDataAPI.getBestSolve(cubes[selectCube.value])
        .then(data => {
            if (data === 0) {
                document.querySelector("#best").innerHTML = "No solve yet";
                return;
            }
            document.querySelector("#best").innerHTML = timeAPI.formatDuration(data);
        });
}


function displaySolveNumber() {
    solvesDataAPI.getCubeNbSolves(cubes[selectCube.value])
        .then(data => {
            document.querySelector("#solveNumber").innerHTML = data;
        });
}

function refreshStatistics() {
    displayAverage();
    displayBest();
    displaySolveNumber();
    displaySolvesHistory()
}

selectCube.addEventListener("change", refreshStatistics)

// display the solves history in a table

function displaySolvesHistory() {
    solvesDataAPI.getCubeSolves(cubes[selectCube.value])
        .then(data => {
            let table = document.querySelector("#solvesHistory");
            table.innerHTML = "<tr class='tableTr'><th class='tableTh'>Solve number</th><th class='tableTh'>Time</th><th class='tableTh'>Gap to average</th><th class='tableTh'>Edit</th></tr>";

            // we only keep the last 5 solves,
            //let last5solves = data.slice(data.length - 5).reverse();
            let last5Solves = data.length >= 5
                ? data.reverse().slice(0  , 5)
                : data.reverse();

            last5Solves.forEach(solve => {
                let row = document.createElement("tr");
                row.classList.add("tableTr");
                row.innerHTML = "<td class='tableTd'>" + solve.solveNumber + "</td>";
                row.innerHTML += "<td class='tableTd'>" + timeAPI.formatDuration(solve.time) + "</td>";
                row.innerHTML += "<td class='tableTd'>" + timeAPI.formatDuration(solve.time) + "</td>";
                row.innerHTML += "<td class='tableTd'><a href='/editSolve/" + solve.id + "'><i class='fas fa-edit text-custom-blue'></i></a></td>";

                table.appendChild(row);
            });
        });
}

// we refresh the statistics every 0.5 seconds
setInterval(refreshStatistics, 500);