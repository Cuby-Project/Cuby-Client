const {ipcRenderer, contextBridge} = require('electron');
const fs = require('fs');
const path = require("path");
const fse = require("fs-extra")
const {shell} = require('electron');
const moment = require("moment");
const {Chart, LineController, LineElement, PointElement, LinearScale, Title, CategoryScale} = require('chart.js');
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, CategoryScale);

const api = {
    closeWindow: () => ipcRenderer.invoke("closeWindow"),
    maximizeWindow: () => ipcRenderer.invoke("maximizeWindow"),
    minimizeWindow: () => ipcRenderer.invoke("minimizeWindow"),
    generateScramble: async () => await ipcRenderer.invoke("generateScramble"),
};

const appdata = {
    initialize() {
        ipcRenderer.invoke("getDeviceUserDataPath").then((appData) => {
            const pathSource = path.join(__dirname, "../backup");
            fse.copySync(pathSource, appData);
        });
    },

    async appIsInitialized() {
        return await ipcRenderer.invoke("getDeviceUserDataPath");
    },

    changeTheme() {
        ipcRenderer.invoke("getDeviceUserDataPath").then((data) => {
            const themePath = path.join(data, "cubyData/theme.json");
            const content = fs.readFileSync(themePath);
            const theme = JSON.parse(content);
            theme.theme = theme.theme === "dark" ? "light" : "dark";
            fs.writeFileSync(themePath, JSON.stringify(theme));
        });
    },

    async getTheme() {
        const data = await ipcRenderer.invoke("getDeviceUserDataPath");
        const themePath = path.join(data, "cubyData/theme.json");
        const content = fs.readFileSync(themePath);
        return JSON.parse(content).theme;
    },
};

const timeAPI = {
    now: () => moment(),

    formatDuration(duration) {
        if (duration === 0) {
            return "DNF";
        }
        return duration >= 0
            ? moment(duration).format("mm:ss,SS")
            : moment(duration).format("-mm:ss,SS");
    },

    getDuration(start) {
        return moment().diff(start);
    },

    registerTime(time, cube, scramble, callback = () => {
    }) {
        ipcRenderer.invoke("getDeviceUserDataPath").then((data) => {
            const solvesPath = path.join(data, "cubyData/solves.json");
            const content = fs.readFileSync(solvesPath, {encoding: "utf8"});
            const parsedContent = JSON.parse(content);
            const solvesTable = parsedContent.solves;
            const now = moment().format("DD/MM/YYYY");

            solvesDataAPI.getCubeSolves(cube).then((data) => {
                const solveNumber = data.length + 1;
                const solve = {
                    date: now,
                    time: time,
                    scramble: scramble,
                    cube,
                    solveNumber,
                };

                solvesTable.push(solve);

                fs.writeFile(solvesPath, JSON.stringify(parsedContent), callback);
            });
        });
    },
};

const solvesDataAPI = {
    async getSolves() {
        const data = await ipcRenderer.invoke("getDeviceUserDataPath");
        const solvesPath = path.join(data, "cubyData/solves.json");
        const content = fs.readFileSync(solvesPath);
        return JSON.parse(content).solves;
    },

    async getAverage(cube) {
        const solves = await solvesDataAPI.getSolves();
        const solvesOfCube = solves.filter((solve) => solve.cube === cube);
        const sum = solvesOfCube.reduce((acc, solve) => acc + solve.time, 0);
        return sum / solvesOfCube.length;
    },

    async getNbSolve() {
        const solves = await solvesDataAPI.getSolves();
        return solves.length;
    },

    async getCubeSolves(cube) {
        const solves = await solvesDataAPI.getSolves();
        return solves.filter((solve) => solve.cube === cube);
    },

    async getCubeNbSolves(cube) {
        const solves = await solvesDataAPI.getSolves();
        const solvesOfCube = solves.filter((solve) => solve.cube === cube);
        return solvesOfCube.length;
    },

    async getBestSolve(cube) {
        const solves = await solvesDataAPI.getSolves();
        let bestSolve = 0;
        const solvesOfCube = solves.filter((solve) => solve.cube === cube);
        solvesOfCube.forEach((solve) => {
            if (solve.time < bestSolve || bestSolve === 0) {
                bestSolve = solve.time;
            }
        });
        return bestSolve;
    },

    async deleteSolve(id) {
        const solves = await solvesDataAPI.getSolves();
        const solvesWithoutDeleted = solves.filter((solve) => solve.id !== id);
        const solvesData = {solves: solvesWithoutDeleted};

        const data = await ipcRenderer.invoke("getDeviceUserDataPath");
        const solvesPath = path.join(data, "cubyData/solves.json");
        fs.writeFileSync(solvesPath, JSON.stringify(solvesData));
    },
};

const openWindowApi = {
    openUrl: (url) => shell.openExternal(url),
};

const chartAPI = {
    chart: null,

    getChart: (cube, element) => {
        solvesDataAPI.getCubeSolves(cube).then((data) => {
            if (chartAPI.chart !== null) {
                chartAPI.chart.clear();
                chartAPI.chart.destroy();
            }

            chartAPI.chart = new Chart(element, {
                type: "line",
                data: {
                    labels: data.map((solve) => solve.solveNumber),
                    datasets: [
                        {
                            label: "Solves for " + cube,
                            data: data.map((solve) => solve.time),
                            borderColor: "#009FFD",
                            fill: false,
                            tension: 0.1,
                        },
                    ],
                },
                options: {
                    scales: {
                        y: {
                            ticks: {
                                callback: function (value, index, values) {
                                    return timeAPI.formatDuration(value);
                                },
                                color: "white",
                                font: {
                                    size: 14,
                                },
                            },
                        },
                        x: {
                            ticks: {
                                color: "white",
                                font: {
                                    size: 14,
                                },
                            },
                        },
                    },
                    elements: {
                        point: {
                            radius: 4,
                            backgroundColor: "#009FFD",
                            hoverRadius: 5,
                            hoverBorderWidth: 2,
                            hoverBackgroundColor: "#009FFD",
                            hitRadius: 5,
                            borderWidth: 2,
                            borderColor: "#009FFD",
                        },
                    },
                },
            });
        });
    },
};

appdata.appIsInitialized().then((data) => {
    const state = fs.existsSync(path.join(data, "cubyData"));
    if (!state) {
        appdata.initialize();
    }
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("openWindowApi", openWindowApi);
    contextBridge.exposeInMainWorld("appdata", appdata);
    contextBridge.exposeInMainWorld("timeAPI", timeAPI);
    contextBridge.exposeInMainWorld("solvesDataAPI", solvesDataAPI);
    contextBridge.exposeInMainWorld("chartAPI", chartAPI);
});