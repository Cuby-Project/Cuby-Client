const CHANGE_BUTTON = document.getElementById("changeView");
const CUBE_SELECT = document.getElementById("selectCube");
const NB_SOLVE_SELECT = document.getElementById("displayedNumber");
const CONTENT = document.getElementById("content");


function displayChart(cube) {
    CONTENT.innerHTML = '<canvas id="myChart"></canvas>'
    chartAPI.getChart(cube, document.getElementById('myChart'));
}

async function generateTableContent(cube) {
    let solves = await solvesDataAPI.getCubeSolves(cube)

    // from the solves we generate the table content with a row per solve
    // and a column for the solve number, the time, the gap to average, the edit button, the delete button and the date
    let content = "<tr class='tableTr'><th class='tableTh'>Solve number</th><th class='tableTh'>Time</th><th class='tableTh'>Gap to average</th><th class='tableTh'>Date</th><th class='tableTh'>Edit</th><th class='tableTh'>Delete</th></tr>";
    let average = await solvesDataAPI.getAverage(cube);
    let nbSolve = solves.length;

    // if there is no solve yet, we display a message
    if (nbSolve === 0) {
        return "<tr class='tableTr'><td class='tableTd' colspan='6'>No solve yet</td></tr>";
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
        let row = `<tr class='tableTr'><td class='tableTd'>${nbSolve}</td><td class='tableTd'>${timeAPI.formatDuration(solve.time)}</td>`;

        if (negative) {
            row += `<td class='tableTd text-red-500'>${gapString}</td>`;
        } else {
            row += `<td class='tableTd text-green-500'>${gapString}</td>`;
        }

        row += `<td class='tableTd'>${solve.date}</td><td class='tableTd'><button class='text-custom-blue' id='editButton${nbSolve}'><i class='fa-solid fa-edit'></i></button></td><td class='tableTd'><button class='text-red-500' id='deleteButton${nbSolve}'><i class='fa-solid fa-trash'></i></button></td></tr>`;
        content += row;
        nbSolve--;
    });

    return content;

}

async function displayTable(cube) {
    let content = await generateTableContent(cube);
    CONTENT.innerHTML = `
                        <div class='dark:bg-custom-gray-3 bg-blue-200 rounded-xl h-[65vh] w-hull flex items-center justify-center p-4 mx-2'>
                            <table class='dark:text-white w-full' id='solvesHistory'>
                                ${content}
                            </table>
                        </div>
                        `;

}

CUBE_SELECT.addEventListener('change', function () {
    displayChart(this.value);
});


CHANGE_BUTTON.addEventListener('click', function () {
    if (document.getElementById('content').display === "chart") {
        document.getElementById('content').display = "table"

        // display chart icon in the button and display the table
        let cube = CUBE_SELECT.value;
        CHANGE_BUTTON.innerHTML = "<i class='fa-solid fa-table-list mx-1'></i> change display";
        displayChart(CUBE_SELECT.value);
    } else {
        document.getElementById('content').display = "chart";

        // display table icon in the button and display the chart
        CHANGE_BUTTON.innerHTML = "<i class='fa-solid fa-chart-line mx-1'></i> change display";
        displayTable(CUBE_SELECT.value);
    }
});

displayChart("3x3x3");