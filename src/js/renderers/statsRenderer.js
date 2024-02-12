const CHANGE_BUTTON = document.getElementById("changeView");
const CUBE_SELECT = document.getElementById("selectCube");
const NB_SOLVE_SELECT = document.getElementById("displayedNumber");
const CONTENT = document.getElementById("content");
const bestSolveElement = document.querySelector('.fa-star + span');
const averageElement = document.querySelector('.fa-chart-line + span');
const solvesElement = document.querySelector('.fa-signal + span');
const bestAo5Element = document.querySelector('.fa-gauge-simple + span');
const bestAo12Element = document.querySelector('.fa-gauge-high + span');
const firstSolveDateElement = document.querySelector('.fa-calendar-minus + span');
const lastSolveDateElement = document.querySelector('.fa-calendar-plus + span');

function displayContent() {
    if (CONTENT.getAttribute('display') === "chart") {
        displayChart(CUBE_SELECT.value);
    } else {
        displayTable(CUBE_SELECT.value);
    }

    solvesDataAPI.getBestSolve(CUBE_SELECT.value).then(bestSolve => {
        bestSolveElement.textContent = timeAPI.formatDuration(bestSolve);
    });

    solvesDataAPI.getAverage(CUBE_SELECT.value).then(average => {
        averageElement.textContent = timeAPI.formatDuration(average);
    });

    solvesDataAPI.getNbSolve(CUBE_SELECT.value).then(nbSolve => {
        solvesElement.textContent = nbSolve;
    });

    solvesDataAPI.getBestAo5(CUBE_SELECT.value).then(bestAo5 => {
        bestAo5Element.textContent = timeAPI.formatDuration(bestAo5);
    });

    solvesDataAPI.getBestAo12(CUBE_SELECT.value).then(bestAo12 => {
        bestAo12Element.textContent = timeAPI.formatDuration(bestAo12);
    });

    solvesDataAPI.getFirstSolveDate(CUBE_SELECT.value).then(firstSolveDate => {
        firstSolveDateElement.textContent =firstSolveDate
    });

    solvesDataAPI.getLastSolveDate(CUBE_SELECT.value).then(lastSolveDate => {
        lastSolveDateElement.textContent = lastSolveDate
        console.log(lastSolveDate)
    });
}

function displayChart(cube) {
    CONTENT.innerHTML = '<canvas id="myChart"></canvas>'
    chartAPI.getChart(cube, document.getElementById('myChart'));
}

async function displayTable(cube) {
    let solves = await solvesDataAPI.getCubeSolves(cube);
    CONTENT.innerHTML = `
                        <div class="grid grid-solves grid-cols-1 grid-row-2 dark:bg-custom-gray-2 bg-blue-100 rounded-lg shadow-lg p-5 w-full h-[60vh] m-1">
                            <div class="first-row grid grid-rows-1 grid-cols-5 mr-[11px]">
                                <div class="dark:text-white text-center grid-cell font-bold">solve number</div>
                                <div class="dark:text-white text-center grid-cell font-bold">time</div>
                                <div class="dark:text-white text-center grid-cell font-bold">gap to average</div>
                                <div class="dark:text-white text-center grid-cell font-bold">date</div>
                                <div class="dark:text-white text-center grid-cell font-bold">edit</div>
                            </div>
                            <div class="grid grid-cols-5 grid-rows-${solves.length + 1} max-h-[60vh] overflow-y-scroll">
                                ${
        solves.reverse().map((solve) => {
            let average = 0;
            solves.forEach((solve) => {
                average += solve.time;
            });
            average = average / solves.length;
            let negative = false;
            let gapToAverage;
            if (solve.time > average) {
                gapToAverage = solve.time - average;
                negative = true;
            } else {
                gapToAverage = average - solve.time;
            }
            return `
                                        <div class="dark:text-white grid-cell">${solve.solveNumber}</div>
                                        <div class="dark:text-white grid-cell">${timeAPI.formatDuration(solve.time)}</div>
                                        ${negative ? `<div class="grid-cell text-red-500">+ ${timeAPI.formatDuration(gapToAverage)}</div>`
                : `<div class="grid-cell text-green-500">- ${timeAPI.formatDuration(gapToAverage)}</div>`}
                                        <div class="grid-cell dark:text-white">${solve.date}</div>
                                        <div class="grid-cell dark:text-white"><i class='fas fa-edit text-custom-blue'></i></div>`;
        }).join(``)}
                            </div>
                        </div>
                        `;
}

CUBE_SELECT.addEventListener('change', function () {
    displayContent();
});


CHANGE_BUTTON.addEventListener('click', function () {
    if (CONTENT.getAttribute('display') === "chart") {
        CONTENT.setAttribute('display', "table");
        CHANGE_BUTTON.innerHTML = "<i class='fa-solid fa-chart-line mx-2'></i> Chart";
    } else {
        CONTENT.setAttribute('display', "chart")
        CHANGE_BUTTON.innerHTML = "<i class='fa-solid fa-table-list mx-2'></i> Table";
    }
    displayContent();

});

displayContent();