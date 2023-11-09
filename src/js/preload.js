const { ipcRenderer, contextBridge } = require('electron');
const fs = require('fs');
const path = require("path");
const fse = require("fs-extra")
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

const openWindowApi = {
    openUrl: (url) => {
        shell.openExternal(url)
    }
}

contextBridge.exposeInMainWorld("openWindowApi", openWindowApi);

appdata.appIsInitialized()
    .then(data => {
        let state = fs.existsSync(path.join(data, "cubyData"));
        if (!state) {
            appdata.initialize();
        }
        contextBridge.exposeInMainWorld("appdata", appdata);
    })
