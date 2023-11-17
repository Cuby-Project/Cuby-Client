const {ipcRenderer, contextBridge} = require('electron');
const fs = require('fs');
const path = require("path");
const fse = require("fs-extra")
const { shell } = require('electron');
const moment = require("moment");
const { shell } = require('electron');

const api = {
    closeWindow: () => {
        ipcRenderer.invoke("closeWindow");
    },
    maximizeWindow: () => {
        ipcRenderer.invoke("maximizeWindow");
    },
    minimizeWindow: () => {
        ipcRenderer.invoke("minimizeWindow");
    },
    generateScramble: async () => {
        return await ipcRenderer.invoke("generateScramble");
    }
};

contextBridge.exposeInMainWorld("api", api);

const appdata = {
    initialize() {
        ipcRenderer.invoke("getDeviceUserDataPath")
            .then(appData => {
                let pathSource = path.join(__dirname, "../backup");
                fse.copySync(pathSource, appData);
            });
    },

    async appIsInitialized() {
        return await ipcRenderer.invoke("getDeviceUserDataPath");
    },

    changeTheme() {
        ipcRenderer.invoke("getDeviceUserDataPath")
            .then(data => {
                    let themePath = path.join(data, "cubyData/theme.json");
                    let content = fs.readFileSync(themePath);
                    let theme = JSON.parse(content);
                    if (theme.theme === "dark") {
                        theme.theme = "light";
                    } else {
                        theme.theme = "dark";
                    }
                    fs.writeFileSync(themePath, JSON.stringify(theme))
                }
            );
    },

    getTheme() {
        let p = new Promise((resolve, reject) => {
            ipcRenderer.invoke("getDeviceUserDataPath")
                .then(data => {
                        let Themepath = path.join(data, "cubyData/theme.json");
                        let content = fs.readFileSync(Themepath);
                        let theme = JSON.parse(content).theme;
                        resolve(theme);
                    }
                );
        });
        return p.then(data => {
            return data;
        });
    }
}

const timeAPI = {

    /**
     * returns a moment instance
     * @returns {*|moment.Moment}
     */
    now() {
        return moment();
    },

    /**
     * returns the formatted time between now and the param time
     * @returns {string}
     * @param duration (milliseconds)
     */
    formatDuration(duration) {
        return moment(duration).format("mm:ss,SS");
    },

    /**
     * returns the  time between now and the param time in milliseconds
     * @param start
     * @returns {string}
     */
    getDuration(start) {
        return moment().diff(start);
    },

    /**
     * this function save in the json the time
     * @param time
     * @param cube
     * @param scramble
     */
    registerTime(time, cube, scramble) {
        ipcRenderer.invoke("getDeviceUserDataPath")
            .then(data => {
                    let solvesPath = path.join(data, "cubyData/solves.json");
                    let content = fs.readFileSync(solvesPath, {encoding: "utf8"});
                    let parsedContent = JSON.parse(content);
                    let solvesTable = parsedContent.solves;

                    let now = moment().format("DD/MM/YYYY");

                    solvesDataAPI.getCubeSolves(cube)
                        .then(data => {
                            let solveNumber = data.length + 1;
                            // the id is the solve number
                            let solve = {
                                date: now,
                                time: time,
                                scramble: scramble,
                                cube,
                                solveNumber,
                            }

                            solvesTable.push(solve);

                            fs.writeFileSync(solvesPath, JSON.stringify(parsedContent));
                        });
                }
            );
    }
}

const solvesDataAPI = {

    /**
     * get all the solves
     */
    getSolves() {
        let p = new Promise((resolve, reject) => {
            ipcRenderer.invoke("getDeviceUserDataPath")
                .then(data => {
                        let solvesPath = path.join(data, "cubyData/solves.json");
                        let content = fs.readFileSync(solvesPath);
                        let solves = JSON.parse(content).solves;
                        resolve(solves);
                    }
                );
        });
        return p.then(data => {
            return data;
        });
    },

    /**
     * get the average of the all the solves of the cube param
     */
    getAverage(cube) {
        let p = new Promise((resolve, reject) => {
            let solves = solvesDataAPI.getSolves()
                .then(solves => {
                    let sum = 0;
                    let solvesOfCube = solves.filter(solve => solve.cube === cube);
                    solvesOfCube.forEach(solve => {
                        sum += solve.time;
                    });
                    let average = sum / solvesOfCube.length;
                    resolve(average);
                });
        });
        return p.then(data => {
            return data;
        });
    },

    getNbSolve() {
        let p = new Promise((resolve, reject) => {
            let solves = solvesDataAPI.getSolves()
                .then(solves => {
                    resolve(solves.length);
                });
        });
        return p.then(data => {
            return data;
        });
    },

    /*
     * get solves from a specific cube
     */

    getCubeSolves(cube) {
        let p = new Promise((resolve, reject) => {
            let solves = solvesDataAPI.getSolves()
                .then(solves => {
                    let solvesOfCube = [];
                    for (let i = 0; i < solves.length; i++) {
                        if (solves[i].cube === cube) {
                            solvesOfCube[i] = solves[i];
                        }
                    }
                    resolve(solvesOfCube);
                });
        });
        return p.then(data => {
            return data;
        });
    },

    /**
     * get the number of solves of the cube param
     */
    getCubeNbSolves(cube) {
        let p = new Promise((resolve, reject) => {
            let solves = solvesDataAPI.getSolves()
                .then(solves => {
                    let solvesOfCube = solves.filter(solve => solve.cube === cube);
                    resolve(solvesOfCube.length);
                });
        });
        return p.then(data => {
            return data;
        });
    },

    /**
     * get the best solve of the cube param
     */
    getBestSolve(cube) {
        let p = new Promise((resolve, reject) => {
            let solves = solvesDataAPI.getSolves()
                .then(solves => {
                    let bestSolve = 0;
                    let solvesOfCube = solves.filter(solve => solve.cube === cube);
                    solvesOfCube.forEach(solve => {
                        if (solve.time < bestSolve || bestSolve === 0) {
                            bestSolve = solve.time;
                        }
                    });
                    resolve(bestSolve);
                });
        });
        return p.then(data => {
            return data;
        });
    },

    /*
     * delete a solve from its id
     */
    deleteSolve(id) {
        let p = new Promise((resolve, reject) => {
            let solves = solvesDataAPI.getSolves()
                .then(solves => {
                    let solvesWithoutDeleted = solves.filter(solve => solve.id !== id);
                    let solvesData = {
                        "solves": solvesWithoutDeleted
                    }
                    ipcRenderer.invoke("getDeviceUserDataPath")
                        .then(data => {
                                let solvesPath = path.join(data, "cubyData/solves.json");
                                fs.writeFileSync(solvesPath, JSON.stringify(solvesData));
                                resolve();
                            }
                        );
                });
        });
        return p.then(data => {
            return data;
        });
    },


}


appdata.appIsInitialized()
    .then(data => {
        let state = fs.existsSync(path.join(data, "cubyData"));
        if (!state) {
            appdata.initialize();
        }
        contextBridge.exposeInMainWorld("appdata", appdata);
        contextBridge.exposeInMainWorld("timeAPI", timeAPI);
        contextBridge.exposeInMainWorld("solvesDataAPI", solvesDataAPI);
    })
