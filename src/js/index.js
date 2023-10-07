const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let win;
function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('src/pages/index.html')
    win.setIcon(path.join(__dirname, '../img/icon.ico'));
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    ipcMain.handle('closeWindow', (event) => {
        app.quit();
    })

    ipcMain.handle('maximizeWindow', (event) => {
        if (win.isMaximized()) {
            win.restore();
        } else {
            win.maximize();
        }
    })

    ipcMain.handle('minimizeWindow', (event) => {
        console.log('minimize')
        win.minimize();
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

