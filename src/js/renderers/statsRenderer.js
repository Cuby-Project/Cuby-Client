const CHANGE_BUTTON = document.getElementById("changeView");
const CUBE_SELECT = document.getElementById("selectCube");
const NB_SOLVE_SELECT = document.getElementById("displayedNumber");
const CONTENT = document.getElementById("content");

function displayContent(change = false) {
    if (CONTENT.getAttribute('display') === "chart") {
        displayChart(CUBE_SELECT.value);
    } else {
        displayTable(CUBE_SELECT.value);
    }
}

function displayChart(cube) {
    CONTENT.innerHTML = '<canvas id="myChart"></canvas>'
    chartAPI.getChart(cube, document.getElementById('myChart'));
}

async function displayTable(cube) {
    // TODO: change to a grid
    let solves = await solvesDataAPI.getCubeSolves(cube);
    CONTENT.innerHTML = `
                        <div class="grid grid-cols-5 grid-rows-${solves.length + 1} dark:bg-custom-gray-2 bg-blue-100 rounded-lg shadow-lg p-5 w-full h-[65vh] m-1">
                            <div class="text-center text-white font-bold">solve number</div>
                            <div class="text-center text-white font-bold">time</div>
                            <div class="text-center text-white font-bold">gap to average</div>
                            <div class="text-center text-white font-bold">scramble</div>
                            <div class="text-center text-white font-bold">edit</div>
                            ${solves.map((solve) => {
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
                                    <div class="text-center text-white grid-cell">${solve.solveNumber}</div>
                                    <div class="text-center text-white grid-cell">${timeAPI.formatDuration(solve.time)}</div>
                                    ${negative ? `<div class="text-center grid-cell text-red-500">+ ${timeAPI.formatDuration(gapToAverage)}</div>` 
                                               : `<div class="text-center grid-cell text-green-500">- ${timeAPI.formatDuration(gapToAverage)}</div>`}
                                    <div class="text-center grid-cell text-white">${solve.scramble}</div>
                                    <div class="text-center grid-cell text-white"><i class='fas fa-edit text-custom-blue'></i></div>`;
                            }).join('')}
                        }`;
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