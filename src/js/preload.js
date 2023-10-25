const { ipcRenderer, contextBridge } = require('electron');
const fs = require('fs');
const path = require("path");
const fse = require("fs-extra")
const moment = require("moment");

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
    initialize(){
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
    registertime(time, cube, scramble) {
        ipcRenderer.invoke("getDeviceUserDataPath")
            .then(data => {
                    let solvesPath = path.join(data, "cubyData/solves.json");
                    let now = this.now()
                    let solve = {
                        "date": now,
                        "time": time,
                        "scramble": scramble,
                        "cube": cube
                    }
                    let content = fs.readFileSync(solvesPath, {encoding: "utf8"});
                    let parsedContent = JSON.parse(content);
                }
            );
    }
}

contextBridge.exposeInMainWorld("timeAPI", timeAPI);

appdata.appIsInitialized()
    .then(data => {
        let state = fs.existsSync(path.join(data, "cubyData"));
        if (!state) {
            appdata.initialize();
        }
        contextBridge.exposeInMainWorld("appdata", appdata);
    })
