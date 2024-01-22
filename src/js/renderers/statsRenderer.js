const CHANGE_BUTTON = document.getElementById("changeView");
const CUBE_SELECT = document.getElementById("selectCube");
const NB_SOLVE_SELECT = document.getElementById("displayedNumber");
const CONTENT = document.getElementById("content");

function displayContent(change = false) {
    console.log(CONTENT.getAttribute('display'))
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

async function generateTableContent(cube) {
    let solves = await solvesDataAPI.getCubeSolves(cube)

    // from the solves we generate the table content with a row per solve
    // and a column for the solve number, the time, the gap to average, the edit button, the delete button and the date
    let content = "<thead><tr class='tableTr block'><th class='tableTh'>Solve number</th><th class='tableTh'>Time</th><th class='tableTh'>Gap to average</th><th class='tableTh'>Date</th><th class='tableTh'>Edit</th><th class='tableTh'>Delete</th></tr></thead><tbody class='overflow-auto max-h-[59vh] block'>";
    let average = await solvesDataAPI.getAverage(cube);
    let nbSolve = solves.length;

    // if there is no solve yet, we display a message
    if (nbSolve === 0) {
        return "<tr class='tableTr block'><td class='tableTd' colspan='6'>No solve yet</td></tr></tbody>";
    }

    solves.forEach(solve => {
        let gap = solve.time - average;

        let negative = false;
        // calculate the gap to average
        let gapToAverage;
        if (solve.time > average) {
            gapToAverage = solve.time - average;
            negative = true;
        } else {
            gapToAverage = average - solve.time;
        }
        let gapString = timeAPI.formatDuration(gapToAverage)
        let row = `<tr class='tableTr block'><td class='tableTd'>${nbSolve}</td><td class='tableTd'>${timeAPI.formatDuration(solve.time)}</td>`;

        if (negative) {
            row += `<td class='tableTd text-red-500'>${gapString}</td>`;
        } else {
            row += `<td class='tableTd text-green-500'>${gapString}</td>`;
        }

        row += `<td class='tableTd'>${solve.date}</td><td class='tableTd'><button class='text-custom-blue' id='editButton${nbSolve}'><i class='fa-solid fa-edit'></i></button></td><td class='tableTd'><button class='text-red-500' id='deleteButton${nbSolve}'><i class='fa-solid fa-trash'></i></button></td></tr>`;
        content += row;
        nbSolve--;
    });

    return content + "</tbody>";

}

async function displayTable(cube) {
    let content = await generateTableContent(cube);
    // TODO: change to a grid
    CONTENT.innerHTML = `
                        <div class='dark:bg-custom-gray-3 bg-blue-200 rounded-xl h-fit max-h-[65vh] flex items-center justify-center p-4'>
                            <table class='dark:text-white w-full table-fixed full-width-table' id='solvesHistory'>
                                ${content}
                            </table>
                        </div>
                        `;

}

CUBE_SELECT.addEventListener('change', function () {
    displayContent();
});


CHANGE_BUTTON.addEventListener('click', function () {
    if (CONTENT.getAttribute('display') === "chart") {
        console.log('chart to table')
        CONTENT.setAttribute('display', "table");
        CHANGE_BUTTON.innerHTML = "<i class='fa-solid fa-chart-line mx-2'></i> Chart";
    } else {
        console.log('table to chart')
        CONTENT.setAttribute('display', "chart")
        CHANGE_BUTTON.innerHTML = "<i class='fa-solid fa-table-list mx-2'></i> Table";
    }
    displayContent();

});

displayContent();