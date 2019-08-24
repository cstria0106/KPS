const { app, BrowserWindow, globalShortcut, Menu, ipcMain } = require('electron');
const iohook = require('iohook');

const keySet = [];
const keyStatus = [];
/**
 * @type {BrowserWindow}
 */
let win;

function createWindow() {
    win = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            nodeIntegration: true
        },
        title: "KPS"
    })

    Menu.setApplicationMenu(null);

    iohook.on('keydown', (e) => {
        for (var i = 0; i < keySet.length; i++) {
            if (e.rawcode == keySet[i]) {
                keyDown(i);
                break;
            }
        }
    });

    iohook.on('keyup', (e) => {
        for (var i = 0; i < keySet.length; i++) {
            if (e.rawcode == keySet[i]) {
                keyUp(i);
                break;
            }
        }
    });

    iohook.start();

    win.loadFile('program.html');

    ipcMain.on('register', (event, arg) => {
        register(arg.index, arg.key);
        keyStatus[arg.index] = false;
    });

    ipcMain.on('unregister', (event, arg) => {
        unregister(arg)
        keyStatus[arg] = false;
    });

    ipcMain.on('unregisterAll', (event, arg) => {
        unregisterAll();
        keyStatus.length = 0;
    });
}

function keyDown(index) {
    if (!keyStatus[index]) {
        keyStatus[index] = true;
        win.webContents.send('keyDown', index);
    }
}

function keyUp(index) {
    keyStatus[index] = false;
    win.webContents.send('keyUp', index);
}

function register(index, key) {
    keySet[index] = key;
}

function unregister(index) {
    keySet[index] = -1;
}

function unregisterAll(index) {
    keySet.length = 0;
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (win == null) {
        createWindow;
    }
});