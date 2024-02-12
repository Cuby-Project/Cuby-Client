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
    let puzzle = selectCube.value;
    previewScramble.innerHTML = generatePreview(puzzle, alg);
    changeDisplay();
}

buttonGenerate.addEventListener('click', refreshScramble)
refreshScramble();

buttonDisplayScramble.addEventListener('click', displayPreview)

buttonGenerate.addEventListener('click', refreshScramble)
refreshScramble();

buttonDisplayScramble.addEventListener('click', displayPreview)

// if the scramble preview is display, we refresh it when the cube is changed
selectCube.addEventListener('change', () => {
    if (!previewContainer.classList.contains("hidden")) {
        displayPreview();
    }
    refreshStatistics();
    refreshScramble();
});


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
    timeAPI.registerTime(time, selectCube.value, getScramble(), refreshStatistics);
}

// statistics at the bottom of the page :

function displayAverage() {
    solvesDataAPI.getAverage(selectCube.value)
        .then(data => {
            if (isNaN(data) || data === 0) {
                document.querySelector("#average").innerHTML = "No solve yet";
                return;
            }
            document.querySelector("#average").innerHTML = timeAPI.formatDuration(data);
        });
}

function displayBest() {
    solvesDataAPI.getBestSolve(selectCube.value)
        .then(data => {
            if (data === 0) {
                document.querySelector("#best").innerHTML = "No solve yet";
                return;
            }
            document.querySelector("#best").innerHTML = timeAPI.formatDuration(data);
        });
}


function displaySolveNumber() {
    solvesDataAPI.getCubeNbSolves(selectCube.value)
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
    solvesDataAPI.getCubeSolves(selectCube.value)
        .then(data => {
            let average = 0;
            for (let i = 0; i < data.length; i++) {
                average += data[i].time;
            }
            average = average / data.length;

            let table = document.querySelector("#solvesHistory");
            table.innerHTML = "<tr class='tableTr'><th class='tableTh'>Solve number</th><th class='tableTh'>Time</th><th class='tableTh'>Gap to average</th><th class='tableTh'>Edit</th></tr>";

            // we only keep the last 5 solves,
            let last5Solves = data.length >= 5
                ? data.reverse().slice(0, 5)
                : data.reverse();

            last5Solves.forEach(solve => {
                let row = document.createElement("tr");
                let negative = false;
                // calculate the gap to average
                let gapToAverage;
                if (solve.time > average) {
                    gapToAverage = solve.time - average;
                    negative = true;
                } else {
                    gapToAverage = average - solve.time;
                }

                row.classList.add("tableTr");
                row.innerHTML = "<td class='tableTd'>" + solve.solveNumber + "</td>";
                row.innerHTML += "<td class='tableTd'>" + timeAPI.formatDuration(solve.time) + "</td>";
                if (negative) {
                    row.innerHTML += "<td class='tableTd text-red-500'>+ " + timeAPI.formatDuration(gapToAverage) + "</td>";
                } else {
                    row.innerHTML += "<td class='tableTd text-green-500'>- " + timeAPI.formatDuration(gapToAverage) + "</td>";
                }
                row.innerHTML += "<td class='tableTd'><a href='/editSolve/" + solve.id + "'><i class='fas fa-edit text-custom-blue'></i></a></td>";

                table.appendChild(row);
            });
        });
}

refreshStatistics();