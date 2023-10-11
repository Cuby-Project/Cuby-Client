const { ipcRenderer, contextBridge } = require('electron');
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